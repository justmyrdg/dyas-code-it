import type { NextFunction, Request, Response } from 'express';
import { Topic, Chapter, Lesson, Class, ClassEnrollment, StudentProgress, User } from '../models';
import { createClassWithCode } from '../services/class.service';
import { getOrCreateSubscription, isPremium } from '../services/subscription.service';
import { FREE_TIER_CLASS_LIMIT, MAX_STUDENTS_PER_CLASS } from '../config/limits';
import { sendError } from '../utils/http';

async function findOwnClass(req: Request): Promise<Class | null> {
  const klass = await Class.findByPk(req.params.id);
  // Not revealing whether the class exists: someone else's class is a 404, not a 403.
  if (!klass || klass.teacherId !== req.user!.sub) return null;
  return klass;
}

async function countLessonsForTopic(topicId: string): Promise<number> {
  const chapters = await Chapter.findAll({ where: { topicId }, attributes: ['id'] });
  if (chapters.length === 0) return 0;
  return Lesson.count({ where: { chapterId: chapters.map((c) => c.id) } });
}

export async function listPublishedTopics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topics = await Topic.findAll({ where: { status: 'published' }, order: [['name', 'ASC']] });
    res.json({ topics });
  } catch (err) {
    next(err);
  }
}

export async function createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId, name, schedule } = req.body as {
      topicId?: string;
      name?: string;
      schedule?: string;
    };
    if (!topicId || !name?.trim()) {
      sendError(res, 400, 'missing_fields', 'Topic and class name are required.');
      return;
    }

    // Premium (active) teachers create unlimited classes; free teachers are capped.
    // Count all classes (not just active) so archiving doesn't free up slots.
    const subscription = await getOrCreateSubscription(req.user!.sub);
    if (!isPremium(subscription)) {
      const count = await Class.count({ where: { teacherId: req.user!.sub } });
      if (count >= FREE_TIER_CLASS_LIMIT) {
        sendError(
          res,
          403,
          'class_limit_reached',
          `The free plan is limited to ${FREE_TIER_CLASS_LIMIT} classes.`,
        );
        return;
      }
    }

    const topic = await Topic.findByPk(topicId);
    if (!topic || topic.status !== 'published') {
      sendError(res, 404, 'not_found', 'Topic not found or not published.');
      return;
    }

    const klass = await createClassWithCode({
      topicId,
      teacherId: req.user!.sub,
      name: name.trim(),
      schedule: schedule?.trim() || null,
    });
    res.status(201).json({ class: klass });
  } catch (err) {
    next(err);
  }
}

export async function listClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const classes = await Class.findAll({
      where: { teacherId: req.user!.sub },
      include: [{ model: Topic, as: 'topic', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    const withCounts = await Promise.all(
      classes.map(async (klass) => ({
        ...klass.toJSON(),
        enrolledCount: await ClassEnrollment.count({ where: { classId: klass.id, status: 'active' } }),
        maxStudents: MAX_STUDENTS_PER_CLASS,
      })),
    );
    res.json({ classes: withCounts });
  } catch (err) {
    next(err);
  }
}

export async function getClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const klass = await findOwnClass(req);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const [topic, enrollments] = await Promise.all([
      Topic.findByPk(klass.topicId, { attributes: ['id', 'name', 'description'] }),
      ClassEnrollment.findAll({
        where: { classId: klass.id, status: 'active' },
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
        order: [['createdAt', 'ASC']],
      }),
    ]);
    res.json({
      class: klass,
      topic,
      students: enrollments.map((e) => e.get('student')),
      maxStudents: MAX_STUDENTS_PER_CLASS,
    });
  } catch (err) {
    next(err);
  }
}

export async function getClassProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const klass = await findOwnClass(req);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }

    const [totalLessons, enrollments, progressRows] = await Promise.all([
      countLessonsForTopic(klass.topicId),
      ClassEnrollment.findAll({
        where: { classId: klass.id, status: 'active' },
        include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      }),
      StudentProgress.findAll({ where: { classId: klass.id, completed: true } }),
    ]);

    const completedByStudent = new Map<string, number>();
    const completedByLesson = new Map<string, number>();
    for (const row of progressRows) {
      completedByStudent.set(row.studentId, (completedByStudent.get(row.studentId) ?? 0) + 1);
      completedByLesson.set(row.lessonId, (completedByLesson.get(row.lessonId) ?? 0) + 1);
    }

    const students = enrollments.map((e) => {
      const student = e.get('student') as User;
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        completedLessons: completedByStudent.get(student.id) ?? 0,
        totalLessons,
      };
    });

    const lessonCompletion = [...completedByLesson.entries()].map(([lessonId, count]) => ({
      lessonId,
      completedCount: count,
      enrolledCount: enrollments.length,
    }));

    res.json({ totalLessons, students, lessonCompletion });
  } catch (err) {
    next(err);
  }
}

export async function updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const klass = await findOwnClass(req);
    if (!klass) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const { name, schedule, active } = req.body as {
      name?: string;
      schedule?: string | null;
      active?: boolean;
    };
    if (name !== undefined) {
      if (!name.trim()) {
        sendError(res, 400, 'missing_fields', 'Class name cannot be empty.');
        return;
      }
      klass.name = name.trim();
    }
    if (schedule !== undefined) klass.schedule = schedule;
    if (active !== undefined) klass.active = Boolean(active);
    await klass.save();
    res.json({ class: klass });
  } catch (err) {
    next(err);
  }
}
