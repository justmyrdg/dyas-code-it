import type { NextFunction, Request, Response } from 'express';
import { AssessmentSubmission, ChapterAssessment, Class, User } from '../models';
import {
  behavioralFlags,
  isSuspiciouslySimilar,
  type IntegrityMetadata,
} from '../services/similarity.service';
import { sendError } from '../utils/http';

interface SimilarityFlag {
  assessmentId: string;
  assessmentTitle: string;
  questionIndex: number;
  studentA: { id: string; name: string };
  studentB: { id: string; name: string };
  similarity: number;
}

interface BehaviorFlag {
  assessmentId: string;
  assessmentTitle: string;
  student: { id: string; name: string };
  submissionId: string;
  flags: string[];
}

function codeAnswers(answers: unknown): Map<number, string> {
  const result = new Map<number, string>();
  if (!Array.isArray(answers)) return result;
  answers.forEach((answer, index) => {
    const source = (answer as { source?: unknown })?.source;
    if (typeof source === 'string' && source.trim()) {
      result.set(index, source);
    }
  });
  return result;
}

// On-demand integrity report for one class: pairwise code-similarity across the
// latest submission per student per assessment, plus behavioral flags from the
// client-captured metadata. Dyas usage is deliberately NOT an input here.
export async function getClassIntegrityReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const klass = await Class.findByPk(req.params.classId);
    if (!klass || klass.teacherId !== req.user!.sub) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }

    const submissions = await AssessmentSubmission.findAll({
      where: { classId: klass.id },
      order: [['attemptNumber', 'ASC']],
    });
    if (!submissions.length) {
      res.json({ similarityFlags: [], behaviorFlags: [] });
      return;
    }

    const students = await User.findAll({
      where: { id: [...new Set(submissions.map((s) => s.studentId))] },
      attributes: ['id', 'name'],
    });
    const studentName = new Map(students.map((s) => [s.id, s.name]));

    const assessments = await ChapterAssessment.findAll({
      where: { id: [...new Set(submissions.map((s) => s.assessmentId))] },
      attributes: ['id', 'title'],
    });
    const assessmentTitle = new Map(assessments.map((a) => [a.id, a.title]));

    // Latest attempt per (student, assessment).
    const latest = new Map<string, AssessmentSubmission>();
    for (const submission of submissions) {
      latest.set(`${submission.studentId}:${submission.assessmentId}`, submission);
    }

    const byAssessment = new Map<string, AssessmentSubmission[]>();
    for (const submission of latest.values()) {
      const list = byAssessment.get(submission.assessmentId) ?? [];
      list.push(submission);
      byAssessment.set(submission.assessmentId, list);
    }

    const similarityFlags: SimilarityFlag[] = [];
    const behaviorFlagList: BehaviorFlag[] = [];

    for (const [assessmentId, subs] of byAssessment) {
      // Behavioral flags per submission.
      for (const submission of subs) {
        const flags = behavioralFlags(submission.integrity as IntegrityMetadata | null);
        if (flags.length) {
          behaviorFlagList.push({
            assessmentId,
            assessmentTitle: assessmentTitle.get(assessmentId) ?? 'Assessment',
            student: {
              id: submission.studentId,
              name: studentName.get(submission.studentId) ?? 'Unknown',
            },
            submissionId: submission.id,
            flags,
          });
        }
      }

      // Pairwise code similarity per question.
      for (let i = 0; i < subs.length; i++) {
        const answersA = codeAnswers(subs[i].answers);
        for (let j = i + 1; j < subs.length; j++) {
          const answersB = codeAnswers(subs[j].answers);
          for (const [questionIndex, codeA] of answersA) {
            const codeB = answersB.get(questionIndex);
            if (!codeB) continue;
            const { similar, score } = isSuspiciouslySimilar(codeA, codeB);
            if (similar) {
              similarityFlags.push({
                assessmentId,
                assessmentTitle: assessmentTitle.get(assessmentId) ?? 'Assessment',
                questionIndex,
                studentA: { id: subs[i].studentId, name: studentName.get(subs[i].studentId) ?? 'Unknown' },
                studentB: { id: subs[j].studentId, name: studentName.get(subs[j].studentId) ?? 'Unknown' },
                similarity: Math.round(score * 100) / 100,
              });
            }
          }
        }
      }
    }

    similarityFlags.sort((a, b) => b.similarity - a.similarity);
    res.json({ similarityFlags, behaviorFlags: behaviorFlagList });
  } catch (err) {
    next(err);
  }
}
