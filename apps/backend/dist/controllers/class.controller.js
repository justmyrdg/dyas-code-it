"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPublishedTopics = listPublishedTopics;
exports.createClass = createClass;
exports.listClasses = listClasses;
exports.getClass = getClass;
exports.getClassProgress = getClassProgress;
exports.updateClass = updateClass;
const models_1 = require("../models");
const class_service_1 = require("../services/class.service");
const subscription_service_1 = require("../services/subscription.service");
const limits_1 = require("../config/limits");
const http_1 = require("../utils/http");
async function findOwnClass(req) {
    const klass = await models_1.Class.findByPk(req.params.id);
    // Not revealing whether the class exists: someone else's class is a 404, not a 403.
    if (!klass || klass.teacherId !== req.user.sub)
        return null;
    return klass;
}
async function countLessonsForTopic(topicId) {
    const chapters = await models_1.Chapter.findAll({ where: { topicId }, attributes: ['id'] });
    if (chapters.length === 0)
        return 0;
    return models_1.Lesson.count({ where: { chapterId: chapters.map((c) => c.id) } });
}
async function listPublishedTopics(_req, res, next) {
    try {
        const topics = await models_1.Topic.findAll({ where: { status: 'published' }, order: [['name', 'ASC']] });
        res.json({ topics });
    }
    catch (err) {
        next(err);
    }
}
async function createClass(req, res, next) {
    try {
        const { topicId, name, schedule } = req.body;
        if (!topicId || !name?.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Topic and class name are required.');
            return;
        }
        // Premium (active) teachers create unlimited classes; free teachers are capped.
        // Count all classes (not just active) so archiving doesn't free up slots.
        const subscription = await (0, subscription_service_1.getOrCreateSubscription)(req.user.sub);
        if (!(0, subscription_service_1.isPremium)(subscription)) {
            const count = await models_1.Class.count({ where: { teacherId: req.user.sub } });
            if (count >= limits_1.FREE_TIER_CLASS_LIMIT) {
                (0, http_1.sendError)(res, 403, 'class_limit_reached', `The free plan is limited to ${limits_1.FREE_TIER_CLASS_LIMIT} classes.`);
                return;
            }
        }
        const topic = await models_1.Topic.findByPk(topicId);
        if (!topic || topic.status !== 'published') {
            (0, http_1.sendError)(res, 404, 'not_found', 'Topic not found or not published.');
            return;
        }
        const klass = await (0, class_service_1.createClassWithCode)({
            topicId,
            teacherId: req.user.sub,
            name: name.trim(),
            schedule: schedule?.trim() || null,
        });
        res.status(201).json({ class: klass });
    }
    catch (err) {
        next(err);
    }
}
async function listClasses(req, res, next) {
    try {
        const classes = await models_1.Class.findAll({
            where: { teacherId: req.user.sub },
            include: [{ model: models_1.Topic, as: 'topic', attributes: ['id', 'name'] }],
            order: [['createdAt', 'DESC']],
        });
        const withCounts = await Promise.all(classes.map(async (klass) => ({
            ...klass.toJSON(),
            enrolledCount: await models_1.ClassEnrollment.count({ where: { classId: klass.id, status: 'active' } }),
            maxStudents: limits_1.MAX_STUDENTS_PER_CLASS,
        })));
        res.json({ classes: withCounts });
    }
    catch (err) {
        next(err);
    }
}
async function getClass(req, res, next) {
    try {
        const klass = await findOwnClass(req);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const [topic, enrollments] = await Promise.all([
            models_1.Topic.findByPk(klass.topicId, { attributes: ['id', 'name', 'description'] }),
            models_1.ClassEnrollment.findAll({
                where: { classId: klass.id, status: 'active' },
                include: [{ model: models_1.User, as: 'student', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
                order: [['createdAt', 'ASC']],
            }),
        ]);
        res.json({
            class: klass,
            topic,
            students: enrollments.map((e) => e.get('student')),
            maxStudents: limits_1.MAX_STUDENTS_PER_CLASS,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getClassProgress(req, res, next) {
    try {
        const klass = await findOwnClass(req);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const [totalLessons, enrollments, progressRows] = await Promise.all([
            countLessonsForTopic(klass.topicId),
            models_1.ClassEnrollment.findAll({
                where: { classId: klass.id, status: 'active' },
                include: [{ model: models_1.User, as: 'student', attributes: ['id', 'name', 'email'] }],
            }),
            models_1.StudentProgress.findAll({ where: { classId: klass.id, completed: true } }),
        ]);
        const completedByStudent = new Map();
        const completedByLesson = new Map();
        for (const row of progressRows) {
            completedByStudent.set(row.studentId, (completedByStudent.get(row.studentId) ?? 0) + 1);
            completedByLesson.set(row.lessonId, (completedByLesson.get(row.lessonId) ?? 0) + 1);
        }
        const students = enrollments.map((e) => {
            const student = e.get('student');
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
    }
    catch (err) {
        next(err);
    }
}
async function updateClass(req, res, next) {
    try {
        const klass = await findOwnClass(req);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const { name, schedule, active } = req.body;
        if (name !== undefined) {
            if (!name.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Class name cannot be empty.');
                return;
            }
            klass.name = name.trim();
        }
        if (schedule !== undefined)
            klass.schedule = schedule;
        if (active !== undefined)
            klass.active = Boolean(active);
        await klass.save();
        res.json({ class: klass });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=class.controller.js.map