import type { NextFunction, Request, Response } from 'express';
import { Chapter, Class, ClassEnrollment, ChapterAssessment, AssessmentSubmission, User } from '../models';
import { SUPPORTED_LANGUAGES } from '../services/code-execution.service';
import { gradeAssessmentAuto, type AssessmentQuestion, type QuestionType } from '../services/grading.service';
import { sendError } from '../utils/http';
import { emitToUser } from '../realtime/io';

const QUESTION_TYPES: QuestionType[] = ['mcq', 'code', 'short_answer'];

// Validates the questions array for an assessment. Returns clean questions or an error message.
function parseQuestions(input: unknown): AssessmentQuestion[] | string {
  if (!Array.isArray(input) || input.length === 0) {
    return 'An assessment needs at least one question.';
  }
  const questions: AssessmentQuestion[] = [];
  for (const item of input) {
    if (typeof item !== 'object' || item === null) return 'Each question must be an object.';
    const q = item as Record<string, unknown>;
    if (typeof q.type !== 'string' || !QUESTION_TYPES.includes(q.type as QuestionType)) {
      return `Each question type must be one of: ${QUESTION_TYPES.join(', ')}.`;
    }
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) return 'Each question needs a prompt.';
    if (typeof q.points !== 'number' || !Number.isInteger(q.points) || q.points < 1) {
      return 'Each question needs a positive integer points value.';
    }
    const type = q.type as QuestionType;
    const config = (typeof q.config === 'object' && q.config !== null ? q.config : {}) as Record<string, unknown>;

    if (type === 'mcq') {
      if (!Array.isArray(config.options) || config.options.length < 2 || !config.options.every((o) => typeof o === 'string')) {
        return 'mcq questions need an options array of at least two strings.';
      }
      if (typeof config.correctIndex !== 'number' || config.correctIndex < 0 || config.correctIndex >= config.options.length) {
        return 'mcq questions need a correctIndex within the options range.';
      }
    } else if (type === 'code') {
      if (typeof config.language !== 'string' || !SUPPORTED_LANGUAGES.includes(config.language)) {
        return `code questions need a language of: ${SUPPORTED_LANGUAGES.join(', ')}.`;
      }
      if (!Array.isArray(config.testCases) || config.testCases.length < 1) {
        return 'code questions need at least one test case.';
      }
      for (const tc of config.testCases) {
        if (typeof tc !== 'object' || tc === null) return 'each test case must be an object.';
        const t = tc as Record<string, unknown>;
        if (typeof t.stdin !== 'string' || typeof t.expectedStdout !== 'string') {
          return 'each test case needs string stdin and expectedStdout.';
        }
      }
    }
    questions.push({ type, prompt: q.prompt.trim(), points: q.points, config });
  }
  return questions;
}

interface StudentQuestion {
  type: QuestionType;
  prompt: string;
  points: number;
  config: Record<string, unknown>;
}

// Strips answer keys (mcq correctIndex, code expected outputs) before serving to a student.
function toStudentQuestions(questions: AssessmentQuestion[]): StudentQuestion[] {
  return questions.map((q) => {
    const base = { type: q.type, prompt: q.prompt, points: q.points };
    if (q.type === 'mcq') {
      return { ...base, config: { options: (q.config.options as string[]) ?? [] } };
    }
    if (q.type === 'code') {
      return {
        ...base,
        config: {
          language: q.config.language as string,
          starterCode: typeof q.config.starterCode === 'string' ? q.config.starterCode : '',
        },
      };
    }
    return { ...base, config: {} };
  });
}

function computeStatus(totalScore: number, maxScore: number, passingScore: number): 'passed' | 'failed' {
  const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;
  return percent >= passingScore ? 'passed' : 'failed';
}

// --- Admin authoring ---

export async function createAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) {
      sendError(res, 404, 'not_found', 'Chapter not found.');
      return;
    }
    const { title, passingScore, retryCooldownHours } = req.body as {
      title?: string;
      passingScore?: number;
      retryCooldownHours?: number;
    };
    if (!title?.trim()) {
      sendError(res, 400, 'missing_fields', 'Assessment title is required.');
      return;
    }
    const questions = parseQuestions(req.body.questions);
    if (typeof questions === 'string') {
      sendError(res, 400, 'invalid_questions', questions);
      return;
    }
    const assessment = await ChapterAssessment.create({
      chapterId: chapter.id,
      title: title.trim(),
      passingScore: passingScore ?? 70,
      retryCooldownHours: retryCooldownHours ?? 24,
      questions,
    });
    res.status(201).json({ assessment });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assessment = await ChapterAssessment.findByPk(req.params.id);
    if (!assessment) {
      sendError(res, 404, 'not_found', 'Assessment not found.');
      return;
    }
    const { title, passingScore, retryCooldownHours } = req.body as {
      title?: string;
      passingScore?: number;
      retryCooldownHours?: number;
    };
    if (title !== undefined) {
      if (!title.trim()) {
        sendError(res, 400, 'missing_fields', 'Assessment title cannot be empty.');
        return;
      }
      assessment.title = title.trim();
    }
    if (passingScore !== undefined) {
      if (!Number.isInteger(passingScore) || passingScore < 0 || passingScore > 100) {
        sendError(res, 400, 'invalid_passing_score', 'Passing score must be between 0 and 100.');
        return;
      }
      assessment.passingScore = passingScore;
    }
    if (retryCooldownHours !== undefined) {
      if (!Number.isInteger(retryCooldownHours) || retryCooldownHours < 0) {
        sendError(res, 400, 'invalid_cooldown', 'Retry cooldown must be a non-negative integer.');
        return;
      }
      assessment.retryCooldownHours = retryCooldownHours;
    }
    if (req.body.questions !== undefined) {
      const questions = parseQuestions(req.body.questions);
      if (typeof questions === 'string') {
        sendError(res, 400, 'invalid_questions', questions);
        return;
      }
      assessment.questions = questions;
    }
    await assessment.save();
    res.json({ assessment });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const assessment = await ChapterAssessment.findByPk(req.params.id);
    if (!assessment) {
      sendError(res, 404, 'not_found', 'Assessment not found.');
      return;
    }
    await assessment.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// --- Student portal ---

async function findEnrolledClassForStudent(studentId: string, classId: string): Promise<Class | null> {
  const enrollment = await ClassEnrollment.findOne({ where: { studentId, classId, status: 'active' } });
  if (!enrollment) return null;
  return Class.findByPk(classId);
}

// Confirms the assessment's chapter belongs to the class's topic.
async function findAssessmentInClass(assessmentId: string, klass: Class): Promise<ChapterAssessment | null> {
  const assessment = await ChapterAssessment.findByPk(assessmentId);
  if (!assessment) return null;
  const chapter = await Chapter.findByPk(assessment.chapterId, { attributes: ['id', 'topicId'] });
  if (!chapter || chapter.topicId !== klass.topicId) return null;
  return assessment;
}

export async function getAssessmentForStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const klass = await findEnrolledClassForStudent(studentId, req.params.classId);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const assessment = await findAssessmentInClass(req.params.assessmentId, klass);
    if (!assessment) {
      sendError(res, 404, 'not_found', 'Assessment not found.');
      return;
    }
    const submissions = await AssessmentSubmission.findAll({
      where: { studentId, assessmentId: assessment.id, classId: klass.id },
      order: [['attemptNumber', 'ASC']],
    });

    res.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        passingScore: assessment.passingScore,
        retryCooldownHours: assessment.retryCooldownHours,
        questions: toStudentQuestions(assessment.questions),
      },
      submissions,
    });
  } catch (err) {
    next(err);
  }
}

export async function submitAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const klass = await findEnrolledClassForStudent(studentId, req.params.classId);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const assessment = await findAssessmentInClass(req.params.assessmentId, klass);
    if (!assessment) {
      sendError(res, 404, 'not_found', 'Assessment not found.');
      return;
    }
    const { answers, integrity } = req.body as {
      answers?: unknown[];
      integrity?: { tabSwitches?: number; pastedChars?: number; timeSpentSeconds?: number };
    };
    if (!Array.isArray(answers)) {
      sendError(res, 400, 'missing_fields', 'Answers must be an array aligned to the questions.');
      return;
    }

    // Gate retries: block while awaiting grading, once passed, or within the cooldown window.
    const latest = await AssessmentSubmission.findOne({
      where: { studentId, assessmentId: assessment.id, classId: klass.id },
      order: [['attemptNumber', 'DESC']],
    });
    if (latest) {
      if (latest.status === 'pending') {
        sendError(res, 409, 'awaiting_grading', 'Your previous attempt is still being graded.');
        return;
      }
      if (latest.status === 'passed') {
        sendError(res, 409, 'already_passed', 'You have already passed this assessment.');
        return;
      }
      const cooldownMs = assessment.retryCooldownHours * 60 * 60 * 1000;
      const readyAt = new Date(latest.submittedAt).getTime() + cooldownMs;
      if (Date.now() < readyAt) {
        sendError(res, 429, 'cooldown_active', `You can retry after ${new Date(readyAt).toISOString()}.`);
        return;
      }
    }

    const auto = await gradeAssessmentAuto(assessment.questions, answers);
    const totalScore = auto.autoScore; // manualScore is 0 until a teacher grades short answers
    const status = auto.needsManualReview
      ? 'pending'
      : computeStatus(totalScore, auto.maxScore, assessment.passingScore);

    const submission = await AssessmentSubmission.create({
      studentId,
      assessmentId: assessment.id,
      classId: klass.id,
      attemptNumber: (latest?.attemptNumber ?? 0) + 1,
      answers,
      autoScore: auto.autoScore,
      manualScore: 0,
      totalScore,
      maxScore: auto.maxScore,
      status,
      feedback: auto.feedback,
      integrity: integrity
        ? {
            tabSwitches: Number(integrity.tabSwitches) || 0,
            pastedChars: Number(integrity.pastedChars) || 0,
            timeSpentSeconds: Number(integrity.timeSpentSeconds) || 0,
          }
        : null,
    });

    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}

// --- Teacher grading ---

async function findOwnClassAssessmentSubmission(
  teacherId: string,
  submissionId: string,
): Promise<AssessmentSubmission | null> {
  const submission = await AssessmentSubmission.findByPk(submissionId);
  if (!submission) return null;
  const klass = await Class.findByPk(submission.classId, { attributes: ['id', 'teacherId'] });
  if (!klass || klass.teacherId !== teacherId) return null;
  return submission;
}

export async function listPendingSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teacherId = req.user!.sub;
    const klass = await Class.findByPk(req.params.classId, { attributes: ['id', 'teacherId'] });
    // 404 (not 403) for classes the teacher doesn't own, to avoid leaking their existence.
    if (!klass || klass.teacherId !== teacherId) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const submissions = await AssessmentSubmission.findAll({
      where: { classId: klass.id, status: 'pending' },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: ChapterAssessment, as: 'assessment', attributes: ['id', 'title'] },
      ],
      order: [['submittedAt', 'ASC']],
    });
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

export async function getSubmissionForTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await findOwnClassAssessmentSubmission(req.user!.sub, req.params.submissionId);
    if (!submission) {
      sendError(res, 404, 'not_found', 'Submission not found.');
      return;
    }
    const assessment = await ChapterAssessment.findByPk(submission.assessmentId);
    const student = await User.findByPk(submission.studentId, { attributes: ['id', 'name', 'email'] });
    res.json({ submission, assessment, student });
  } catch (err) {
    next(err);
  }
}

export async function gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await findOwnClassAssessmentSubmission(req.user!.sub, req.params.submissionId);
    if (!submission) {
      sendError(res, 404, 'not_found', 'Submission not found.');
      return;
    }
    const assessment = await ChapterAssessment.findByPk(submission.assessmentId);
    if (!assessment) {
      sendError(res, 404, 'not_found', 'Assessment not found.');
      return;
    }
    const { grades } = req.body as { grades?: { index: number; score: number; comment?: string }[] };
    if (!Array.isArray(grades)) {
      sendError(res, 400, 'missing_fields', 'grades must be an array of { index, score }.');
      return;
    }

    const feedback = [...submission.feedback];
    for (const grade of grades) {
      const item = feedback[grade.index];
      if (!item || item.autoGraded) continue; // only short-answer (non-auto) questions are teacher-scored
      const clamped = Math.max(0, Math.min(item.maxPoints, Math.round(grade.score)));
      feedback[grade.index] = { ...item, score: clamped, comment: grade.comment ?? item.comment };
    }

    // Manual score = sum of the teacher-graded (non-auto) questions.
    const manualScore = feedback.reduce((sum, f) => (f.autoGraded ? sum : sum + f.score), 0);
    const totalScore = submission.autoScore + manualScore;

    submission.feedback = feedback;
    submission.manualScore = manualScore;
    submission.totalScore = totalScore;
    submission.status = computeStatus(totalScore, submission.maxScore, assessment.passingScore);
    submission.gradedAt = new Date();
    submission.gradedBy = req.user!.sub;
    await submission.save();

    emitToUser('/projects', submission.studentId, 'submission:graded', {
      submissionId: submission.id,
      assessmentId: submission.assessmentId,
      classId: submission.classId,
      assessmentTitle: assessment.title,
      status: submission.status,
      totalScore: submission.totalScore,
      maxScore: submission.maxScore,
    });

    res.json({ submission });
  } catch (err) {
    next(err);
  }
}
