"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinClass = joinClass;
exports.listMyClasses = listMyClasses;
exports.getClassCurriculum = getClassCurriculum;
exports.getLesson = getLesson;
exports.submitActivity = submitActivity;
exports.completeLesson = completeLesson;
const models_1 = require("../models");
const enrollment_service_1 = require("../services/enrollment.service");
const grading_service_1 = require("../services/grading.service");
const activity_controller_1 = require("./activity.controller");
const http_1 = require("../utils/http");
async function findEnrolledClass(studentId, classId) {
    const enrollment = await models_1.ClassEnrollment.findOne({
        where: { studentId, classId, status: 'active' },
    });
    if (!enrollment)
        return null;
    return models_1.Class.findByPk(classId);
}
// Confirms the lesson belongs to the class's topic before serving it.
async function findLessonInClass(lessonId, klass) {
    const lesson = await models_1.Lesson.findByPk(lessonId);
    if (!lesson)
        return null;
    const chapter = await models_1.Chapter.findByPk(lesson.chapterId, { attributes: ['id', 'topicId'] });
    if (!chapter || chapter.topicId !== klass.topicId)
        return null;
    return lesson;
}
// Confirms an activity's lesson belongs to the class's topic before grading a submission.
async function findActivityInClass(activityId, klass) {
    const activity = await models_1.MiniActivity.findByPk(activityId);
    if (!activity)
        return null;
    const lesson = await models_1.Lesson.findByPk(activity.lessonId, { attributes: ['id', 'chapterId'] });
    if (!lesson)
        return null;
    const chapter = await models_1.Chapter.findByPk(lesson.chapterId, { attributes: ['id', 'topicId'] });
    if (!chapter || chapter.topicId !== klass.topicId)
        return null;
    return activity;
}
async function joinClass(req, res, next) {
    try {
        const { code } = req.body;
        if (!code?.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Class code is required.');
            return;
        }
        const result = await (0, enrollment_service_1.joinClassByCode)(req.user.sub, code);
        if (!result.ok) {
            (0, http_1.sendError)(res, result.status, result.code, result.message);
            return;
        }
        res.status(201).json({ class: result.class });
    }
    catch (err) {
        next(err);
    }
}
async function listMyClasses(req, res, next) {
    try {
        const studentId = req.user.sub;
        const enrollments = await models_1.ClassEnrollment.findAll({
            where: { studentId, status: 'active' },
            include: [
                {
                    model: models_1.Class,
                    as: 'class',
                    include: [
                        { model: models_1.Topic, as: 'topic', attributes: ['id', 'name', 'description'] },
                        { model: models_1.User, as: 'teacher', attributes: ['id', 'name'] },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        const classes = await Promise.all(enrollments.map(async (enrollment) => {
            const klass = enrollment.get('class');
            const chapters = await models_1.Chapter.findAll({ where: { topicId: klass.topicId }, attributes: ['id'] });
            const totalLessons = chapters.length === 0
                ? 0
                : await models_1.Lesson.count({ where: { chapterId: chapters.map((c) => c.id) } });
            const completedLessons = await models_1.StudentProgress.count({
                where: { studentId, classId: klass.id, completed: true },
            });
            return { ...klass.toJSON(), totalLessons, completedLessons };
        }));
        res.json({ classes });
    }
    catch (err) {
        next(err);
    }
}
async function getClassCurriculum(req, res, next) {
    try {
        const studentId = req.user.sub;
        const klass = await findEnrolledClass(studentId, req.params.classId);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const [topic, chapters, progress] = await Promise.all([
            models_1.Topic.findByPk(klass.topicId, { attributes: ['id', 'name', 'description'] }),
            models_1.Chapter.findAll({
                where: { topicId: klass.topicId },
                attributes: ['id', 'title', 'description', 'position'],
                include: [
                    { model: models_1.Lesson, as: 'lessons', attributes: ['id', 'title', 'position'] },
                    { model: models_1.ChapterAssessment, as: 'assessments', attributes: ['id', 'title'] },
                ],
                order: [
                    ['position', 'ASC'],
                    [{ model: models_1.Lesson, as: 'lessons' }, 'position', 'ASC'],
                ],
            }),
            models_1.StudentProgress.findAll({
                where: { studentId, classId: klass.id },
                attributes: ['lessonId', 'completed', 'completedAt', 'lastAccessedAt'],
            }),
        ]);
        res.json({ class: klass, topic, chapters, progress });
    }
    catch (err) {
        next(err);
    }
}
async function getLesson(req, res, next) {
    try {
        const studentId = req.user.sub;
        const klass = await findEnrolledClass(studentId, req.params.classId);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const lesson = await findLessonInClass(req.params.lessonId, klass);
        if (!lesson) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Lesson not found.');
            return;
        }
        const [progress] = await models_1.StudentProgress.findOrCreate({
            where: { studentId, classId: klass.id, lessonId: lesson.id },
            defaults: { studentId, classId: klass.id, lessonId: lesson.id },
        });
        progress.lastAccessedAt = new Date();
        await progress.save();
        const activityRows = await models_1.MiniActivity.findAll({
            where: { lessonId: lesson.id },
            order: [['position', 'ASC']],
        });
        const activities = activityRows.map(activity_controller_1.toStudentActivity);
        const submissions = await models_1.ActivitySubmission.findAll({
            where: { studentId, classId: klass.id, activityId: activityRows.map((a) => a.id) },
            order: [['createdAt', 'ASC']],
        });
        res.json({ lesson, progress, activities, submissions });
    }
    catch (err) {
        next(err);
    }
}
async function submitActivity(req, res, next) {
    try {
        const studentId = req.user.sub;
        const klass = await findEnrolledClass(studentId, req.params.classId);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const activity = await findActivityInClass(req.params.activityId, klass);
        if (!activity) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Activity not found.');
            return;
        }
        const { answer } = req.body;
        if (answer === undefined || answer === null || typeof answer !== 'object') {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'An answer is required.');
            return;
        }
        const result = await (0, grading_service_1.gradeActivity)(activity.type, activity.config, answer);
        const priorAttempts = await models_1.ActivitySubmission.count({
            where: { studentId, activityId: activity.id, classId: klass.id },
        });
        const submission = await models_1.ActivitySubmission.create({
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
    }
    catch (err) {
        next(err);
    }
}
async function completeLesson(req, res, next) {
    try {
        const studentId = req.user.sub;
        const klass = await findEnrolledClass(studentId, req.params.classId);
        if (!klass) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const lesson = await findLessonInClass(req.params.lessonId, klass);
        if (!lesson) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Lesson not found.');
            return;
        }
        const [progress] = await models_1.StudentProgress.findOrCreate({
            where: { studentId, classId: klass.id, lessonId: lesson.id },
            defaults: { studentId, classId: klass.id, lessonId: lesson.id },
        });
        if (!progress.completed) {
            progress.completed = true;
            progress.completedAt = new Date();
            await progress.save();
        }
        res.json({ progress });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=student.controller.js.map