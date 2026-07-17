import type { NextFunction, Request, Response } from 'express';
import {
  Topic,
  Chapter,
  Lesson,
  Class,
  ClassEnrollment,
  StudentProgress,
  User,
  MiniActivity,
  ActivitySubmission,
  ChapterAssessment,
} from '../models';
import { joinClassByCode } from '../services/enrollment.service';
import { gradeActivity } from '../services/grading.service';
import { toStudentActivity } from './activity.controller';
import { sendError } from '../utils/http';

async function findEnrolledClass(studentId: string, classId: string): Promise<Class | null> {
  const enrollment = await ClassEnrollment.findOne({
    where: { studentId, classId, status: 'active' },
  });
  if (!enrollment) return null;
  return Class.findByPk(classId);
}

// Confirms the lesson belongs to the class's topic before serving it.
async function findLessonInClass(lessonId: string, klass: Class): Promise<Lesson | null> {
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) return null;
  const chapter = await Chapter.findByPk(lesson.chapterId, { attributes: ['id', 'topicId'] });
  if (!chapter || chapter.topicId !== klass.topicId) return null;
  return lesson;
}

// Confirms an activity's lesson belongs to the class's topic before grading a submission.
async function findActivityInClass(activityId: string, klass: Class): Promise<MiniActivity | null> {
  const activity = await MiniActivity.findByPk(activityId);
  if (!activity) return null;
  const lesson = await Lesson.findByPk(activity.lessonId, { attributes: ['id', 'chapterId'] });
  if (!lesson) return null;
  const chapter = await Chapter.findByPk(lesson.chapterId, { attributes: ['id', 'topicId'] });
  if (!chapter || chapter.topicId !== klass.topicId) return null;
  return activity;
}

export async function joinClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code } = req.body as { code?: string };
    if (!code?.trim()) {
      sendError(res, 400, 'missing_fields', 'Class code is required.');
      return;
    }
    const result = await joinClassByCode(req.user!.sub, code);
    if (!result.ok) {
      sendError(res, result.status, result.code, result.message);
      return;
    }
    res.status(201).json({ class: result.class });
  } catch (err) {
    next(err);
  }
}

export async function listMyClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const enrollments = await ClassEnrollment.findAll({
      where: { studentId, status: 'active' },
      include: [
        {
          model: Class,
          as: 'class',
          include: [
            { model: Topic, as: 'topic', attributes: ['id', 'name', 'description'] },
            { model: User, as: 'teacher', attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const classes = await Promise.all(
      enrollments.map(async (enrollment) => {
        const klass = enrollment.get('class') as Class & { topic: Topic };
        const chapters = await Chapter.findAll({ where: { topicId: klass.topicId }, attributes: ['id'] });
        const totalLessons =
          chapters.length === 0
            ? 0
            : await Lesson.count({ where: { chapterId: chapters.map((c) => c.id) } });
        const completedLessons = await StudentProgress.count({
          where: { studentId, classId: klass.id, completed: true },
        });
        return { ...klass.toJSON(), totalLessons, completedLessons };
      }),
    );

    res.json({ classes });
  } catch (err) {
    next(err);
  }
}

export async function getClassCurriculum(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const klass = await findEnrolledClass(studentId, req.params.classId);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }

    const [topic, chapters, progress] = await Promise.all([
      Topic.findByPk(klass.topicId, { attributes: ['id', 'name', 'description'] }),
      Chapter.findAll({
        where: { topicId: klass.topicId },
        attributes: ['id', 'title', 'description', 'position'],
        include: [
          { model: Lesson, as: 'lessons', attributes: ['id', 'title', 'position'] },
          { model: ChapterAssessment, as: 'assessments', attributes: ['id', 'title'] },
        ],
        order: [
          ['position', 'ASC'],
          [{ model: Lesson, as: 'lessons' }, 'position', 'ASC'],
        ],
      }),
      StudentProgress.findAll({
        where: { studentId, classId: klass.id },
        attributes: ['lessonId', 'completed', 'completedAt', 'lastAccessedAt'],
      }),
    ]);

    res.json({ class: klass, topic, chapters, progress });
  } catch (err) {
    next(err);
  }
}

export async function getLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const klass = await findEnrolledClass(studentId, req.params.classId);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const lesson = await findLessonInClass(req.params.lessonId, klass);
    if (!lesson) {
      sendError(res, 404, 'not_found', 'Lesson not found.');
      return;
    }

    const [progress] = await StudentProgress.findOrCreate({
      where: { studentId, classId: klass.id, lessonId: lesson.id },
      defaults: { studentId, classId: klass.id, lessonId: lesson.id },
    });
    progress.lastAccessedAt = new Date();
    await progress.save();

    const activityRows = await MiniActivity.findAll({
      where: { lessonId: lesson.id },
      order: [['position', 'ASC']],
    });
    const activities = activityRows.map(toStudentActivity);
    const submissions = await ActivitySubmission.findAll({
      where: { studentId, classId: klass.id, activityId: activityRows.map((a) => a.id) },
      order: [['createdAt', 'ASC']],
    });

    res.json({ lesson, progress, activities, submissions });
  } catch (err) {
    next(err);
  }
}

export async function submitActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const klass = await findEnrolledClass(studentId, req.params.classId);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const activity = await findActivityInClass(req.params.activityId, klass);
    if (!activity) {
      sendError(res, 404, 'not_found', 'Activity not found.');
      return;
    }
    const { answer } = req.body as { answer?: unknown };
    if (answer === undefined || answer === null || typeof answer !== 'object') {
      sendError(res, 400, 'missing_fields', 'An answer is required.');
      return;
    }

    const result = await gradeActivity(activity.type, activity.config, answer);
    const priorAttempts = await ActivitySubmission.count({
      where: { studentId, activityId: activity.id, classId: klass.id },
    });
    const submission = await ActivitySubmission.create({
      studentId,
      activityId: activity.id,
      classId: klass.id,
      attemptNumber: priorAttempts + 1,
      answer,
      score: result.score,
      passed: result.passed,
      feedback: result.feedback,
    });

    res.status(201).json({ submission, result });
  } catch (err) {
    next(err);
  }
}

export async function completeLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user!.sub;
    const klass = await findEnrolledClass(studentId, req.params.classId);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const lesson = await findLessonInClass(req.params.lessonId, klass);
    if (!lesson) {
      sendError(res, 404, 'not_found', 'Lesson not found.');
      return;
    }

    const [progress] = await StudentProgress.findOrCreate({
      where: { studentId, classId: klass.id, lessonId: lesson.id },
      defaults: { studentId, classId: klass.id, lessonId: lesson.id },
    });
    if (!progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();
    }

    res.json({ progress });
  } catch (err) {
    next(err);
  }
}
