"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificateEligibility = getCertificateEligibility;
exports.claimCertificate = claimCertificate;
exports.listMyCertificates = listMyCertificates;
exports.getMyCertificate = getMyCertificate;
exports.verifyCertificate = verifyCertificate;
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const qrcode_1 = __importDefault(require("qrcode"));
const models_1 = require("../models");
const http_1 = require("../utils/http");
const APP_URL = process.env.APP_URL || 'http://localhost:4201';
// Certificate codes are unguessable — the verify endpoint is public.
function generateCertificateCode() {
    return crypto_1.default.randomBytes(16).toString('hex');
}
async function checkEligibility(studentId, classRow) {
    const chapters = await models_1.Chapter.findAll({ where: { topicId: classRow.topicId }, attributes: ['id'] });
    const chapterIds = chapters.map((c) => c.id);
    const lessons = chapterIds.length
        ? await models_1.Lesson.findAll({ where: { chapterId: { [sequelize_1.Op.in]: chapterIds } }, attributes: ['id'] })
        : [];
    const lessonIds = lessons.map((l) => l.id);
    const completedLessons = lessonIds.length
        ? await models_1.StudentProgress.count({
            where: { studentId, classId: classRow.id, lessonId: { [sequelize_1.Op.in]: lessonIds }, completed: true },
        })
        : 0;
    const assessments = chapterIds.length
        ? await models_1.ChapterAssessment.findAll({ where: { chapterId: { [sequelize_1.Op.in]: chapterIds } }, attributes: ['id'] })
        : [];
    const assessmentIds = assessments.map((a) => a.id);
    let passedAssessments = 0;
    if (assessmentIds.length) {
        const passed = await models_1.AssessmentSubmission.findAll({
            where: {
                studentId,
                classId: classRow.id,
                assessmentId: { [sequelize_1.Op.in]: assessmentIds },
                status: 'passed',
            },
            attributes: ['assessmentId'],
        });
        passedAssessments = new Set(passed.map((p) => p.assessmentId)).size;
    }
    return {
        // A class with no lessons at all can't be "completed".
        eligible: lessonIds.length > 0 &&
            completedLessons >= lessonIds.length &&
            passedAssessments >= assessmentIds.length,
        totalLessons: lessonIds.length,
        completedLessons,
        totalAssessments: assessmentIds.length,
        passedAssessments,
    };
}
// --- Student endpoints ---
async function getCertificateEligibility(req, res, next) {
    try {
        const enrollment = await models_1.ClassEnrollment.findOne({
            where: { studentId: req.user.sub, classId: req.params.classId, status: 'active' },
        });
        if (!enrollment) {
            (0, http_1.sendError)(res, 404, 'not_found', 'You are not enrolled in this class.');
            return;
        }
        const classRow = await models_1.Class.findByPk(req.params.classId);
        if (!classRow) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const existing = await models_1.Certificate.findOne({
            where: { studentId: req.user.sub, classId: classRow.id },
        });
        const eligibility = await checkEligibility(req.user.sub, classRow);
        res.json({ ...eligibility, certificateId: existing?.id ?? null });
    }
    catch (err) {
        next(err);
    }
}
async function claimCertificate(req, res, next) {
    try {
        const enrollment = await models_1.ClassEnrollment.findOne({
            where: { studentId: req.user.sub, classId: req.params.classId, status: 'active' },
        });
        if (!enrollment) {
            (0, http_1.sendError)(res, 404, 'not_found', 'You are not enrolled in this class.');
            return;
        }
        const classRow = await models_1.Class.findByPk(req.params.classId);
        if (!classRow) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Class not found.');
            return;
        }
        const existing = await models_1.Certificate.findOne({
            where: { studentId: req.user.sub, classId: classRow.id },
        });
        if (existing) {
            res.json({ certificate: existing });
            return;
        }
        const eligibility = await checkEligibility(req.user.sub, classRow);
        if (!eligibility.eligible) {
            (0, http_1.sendError)(res, 403, 'not_eligible', `Complete all lessons (${eligibility.completedLessons}/${eligibility.totalLessons}) and pass all assessments (${eligibility.passedAssessments}/${eligibility.totalAssessments}) first.`);
            return;
        }
        const certificate = await models_1.Certificate.create({
            studentId: req.user.sub,
            classId: classRow.id,
            topicId: classRow.topicId,
            certificateCode: generateCertificateCode(),
            issuedAt: new Date(),
        });
        res.status(201).json({ certificate });
    }
    catch (err) {
        next(err);
    }
}
async function listMyCertificates(req, res, next) {
    try {
        const certificates = await models_1.Certificate.findAll({
            where: { studentId: req.user.sub },
            include: [
                { model: models_1.Topic, as: 'topic', attributes: ['id', 'name'] },
                { model: models_1.Class, as: 'class', attributes: ['id', 'name'] },
            ],
            order: [['issuedAt', 'DESC']],
        });
        res.json({ certificates });
    }
    catch (err) {
        next(err);
    }
}
async function getMyCertificate(req, res, next) {
    try {
        const certificate = await models_1.Certificate.findOne({
            where: { id: req.params.id, studentId: req.user.sub },
            include: [
                { model: models_1.Topic, as: 'topic', attributes: ['id', 'name'] },
                {
                    model: models_1.Class,
                    as: 'class',
                    attributes: ['id', 'name'],
                    include: [{ association: 'teacher', attributes: ['id', 'name'] }],
                },
                { model: models_1.User, as: 'student', attributes: ['id', 'name'] },
            ],
        });
        if (!certificate) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Certificate not found.');
            return;
        }
        const verifyUrl = `${APP_URL}/verify/${certificate.certificateCode}`;
        const qrDataUrl = await qrcode_1.default.toDataURL(verifyUrl, { margin: 1, width: 220 });
        res.json({ certificate, verifyUrl, qrDataUrl });
    }
    catch (err) {
        next(err);
    }
}
// --- Public verification (no auth) ---
async function verifyCertificate(req, res, next) {
    try {
        const certificate = await models_1.Certificate.findOne({
            where: { certificateCode: req.params.code },
            include: [
                { model: models_1.Topic, as: 'topic', attributes: ['name'] },
                {
                    model: models_1.Class,
                    as: 'class',
                    attributes: ['name'],
                    include: [{ association: 'teacher', attributes: ['name'] }],
                },
                { model: models_1.User, as: 'student', attributes: ['name'] },
            ],
        });
        if (!certificate) {
            (0, http_1.sendError)(res, 404, 'not_found', 'No certificate matches this code.');
            return;
        }
        res.json({
            valid: certificate.status === 'active',
            status: certificate.status,
            studentName: certificate.student?.name,
            topicName: certificate.topic?.name,
            className: certificate.class?.name,
            teacherName: certificate.class?.teacher?.name,
            issuedAt: certificate.issuedAt,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=certificate.controller.js.map