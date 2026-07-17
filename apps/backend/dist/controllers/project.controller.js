"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMyProjects = listMyProjects;
exports.createProject = createProject;
exports.getMyProject = getMyProject;
exports.updateMyProject = updateMyProject;
exports.deleteMyProject = deleteMyProject;
exports.saveVersion = saveVersion;
exports.restoreVersion = restoreVersion;
exports.listSharedProjects = listSharedProjects;
exports.getSharedProject = getSharedProject;
exports.leaveVersionFeedback = leaveVersionFeedback;
exports.getPublicProject = getPublicProject;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const code_execution_service_1 = require("../services/code-execution.service");
const http_1 = require("../utils/http");
const VISIBILITIES = ['private', 'shared_with_teacher', 'public'];
// --- Student: own projects ---
async function listMyProjects(req, res, next) {
    try {
        const projects = await models_1.PracticeProject.findAll({
            where: { studentId: req.user.sub },
            order: [['updatedAt', 'DESC']],
        });
        res.json({ projects });
    }
    catch (err) {
        next(err);
    }
}
async function createProject(req, res, next) {
    try {
        const { title, description, language } = req.body;
        if (!title?.trim() || !language) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Title and language are required.');
            return;
        }
        if (!code_execution_service_1.SUPPORTED_LANGUAGES.includes(language)) {
            (0, http_1.sendError)(res, 400, 'unsupported_language', `Language must be one of: ${code_execution_service_1.SUPPORTED_LANGUAGES.join(', ')}.`);
            return;
        }
        const project = await models_1.PracticeProject.create({
            studentId: req.user.sub,
            title: title.trim(),
            description: description ?? '',
            language,
            challengeId: null,
        });
        res.status(201).json({ project });
    }
    catch (err) {
        next(err);
    }
}
async function getMyProject(req, res, next) {
    try {
        const project = await models_1.PracticeProject.findOne({
            where: { id: req.params.projectId, studentId: req.user.sub },
            include: [{ association: 'versions', separate: true, order: [['versionNumber', 'DESC']] }],
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
async function updateMyProject(req, res, next) {
    try {
        const project = await models_1.PracticeProject.findOne({
            where: { id: req.params.projectId, studentId: req.user.sub },
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        const { title, description, visibility } = req.body;
        if (title !== undefined) {
            if (!title.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Title cannot be empty.');
                return;
            }
            project.title = title.trim();
        }
        if (description !== undefined)
            project.description = description;
        if (visibility !== undefined) {
            if (!VISIBILITIES.includes(visibility)) {
                (0, http_1.sendError)(res, 400, 'invalid_visibility', `Visibility must be one of: ${VISIBILITIES.join(', ')}.`);
                return;
            }
            project.visibility = visibility;
        }
        await project.save();
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
async function deleteMyProject(req, res, next) {
    try {
        const project = await models_1.PracticeProject.findOne({
            where: { id: req.params.projectId, studentId: req.user.sub },
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        await models_1.ProjectVersion.destroy({ where: { projectId: project.id } });
        await project.destroy();
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
async function saveVersion(req, res, next) {
    try {
        const project = await models_1.PracticeProject.findOne({
            where: { id: req.params.projectId, studentId: req.user.sub },
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        const { code, message } = req.body;
        if (typeof code !== 'string') {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'code is required.');
            return;
        }
        const latest = await models_1.ProjectVersion.findOne({
            where: { projectId: project.id },
            order: [['versionNumber', 'DESC']],
        });
        const version = await models_1.ProjectVersion.create({
            projectId: project.id,
            versionNumber: (latest?.versionNumber ?? 0) + 1,
            code,
            message: message?.trim() ?? '',
            teacherFeedback: null,
        });
        // Bump updatedAt so the project list sorts by recent activity.
        project.changed('updatedAt', true);
        await project.save();
        res.status(201).json({ version });
    }
    catch (err) {
        next(err);
    }
}
// Restoring creates a NEW version with the old code — history is never rewritten.
async function restoreVersion(req, res, next) {
    try {
        const project = await models_1.PracticeProject.findOne({
            where: { id: req.params.projectId, studentId: req.user.sub },
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        const source = await models_1.ProjectVersion.findOne({
            where: { id: req.params.versionId, projectId: project.id },
        });
        if (!source) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Version not found.');
            return;
        }
        const latest = await models_1.ProjectVersion.findOne({
            where: { projectId: project.id },
            order: [['versionNumber', 'DESC']],
        });
        const version = await models_1.ProjectVersion.create({
            projectId: project.id,
            versionNumber: (latest?.versionNumber ?? 0) + 1,
            code: source.code,
            message: `Restored from v${source.versionNumber}`,
            teacherFeedback: null,
        });
        res.status(201).json({ version });
    }
    catch (err) {
        next(err);
    }
}
// --- Teacher: projects shared by students in their classes ---
async function studentIdsInTeacherClasses(teacherId) {
    const classes = await models_1.Class.findAll({ where: { teacherId }, attributes: ['id'] });
    if (!classes.length)
        return [];
    const enrollments = await models_1.ClassEnrollment.findAll({
        where: { classId: { [sequelize_1.Op.in]: classes.map((c) => c.id) }, status: 'active' },
        attributes: ['studentId'],
    });
    return [...new Set(enrollments.map((e) => e.studentId))];
}
async function listSharedProjects(req, res, next) {
    try {
        const studentIds = await studentIdsInTeacherClasses(req.user.sub);
        if (!studentIds.length) {
            res.json({ projects: [] });
            return;
        }
        const projects = await models_1.PracticeProject.findAll({
            where: {
                studentId: { [sequelize_1.Op.in]: studentIds },
                visibility: { [sequelize_1.Op.in]: ['shared_with_teacher', 'public'] },
            },
            include: [{ model: models_1.User, as: 'student', attributes: ['id', 'name', 'email'] }],
            order: [['updatedAt', 'DESC']],
        });
        res.json({ projects });
    }
    catch (err) {
        next(err);
    }
}
async function getSharedProject(req, res, next) {
    try {
        const studentIds = await studentIdsInTeacherClasses(req.user.sub);
        const project = await models_1.PracticeProject.findOne({
            where: {
                id: req.params.projectId,
                studentId: { [sequelize_1.Op.in]: studentIds },
                visibility: { [sequelize_1.Op.in]: ['shared_with_teacher', 'public'] },
            },
            include: [
                { model: models_1.User, as: 'student', attributes: ['id', 'name', 'email'] },
                { association: 'versions', separate: true, order: [['versionNumber', 'DESC']] },
            ],
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
async function leaveVersionFeedback(req, res, next) {
    try {
        const studentIds = await studentIdsInTeacherClasses(req.user.sub);
        const project = await models_1.PracticeProject.findOne({
            where: {
                id: req.params.projectId,
                studentId: { [sequelize_1.Op.in]: studentIds },
                visibility: { [sequelize_1.Op.in]: ['shared_with_teacher', 'public'] },
            },
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        const version = await models_1.ProjectVersion.findOne({
            where: { id: req.params.versionId, projectId: project.id },
        });
        if (!version) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Version not found.');
            return;
        }
        const { feedback } = req.body;
        if (typeof feedback !== 'string' || !feedback.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'feedback is required.');
            return;
        }
        version.teacherFeedback = feedback.trim();
        await version.save();
        res.json({ version });
    }
    catch (err) {
        next(err);
    }
}
// --- Public: view a public project by id (portfolio share link) ---
async function getPublicProject(req, res, next) {
    try {
        const project = await models_1.PracticeProject.findOne({
            where: { id: req.params.projectId, visibility: 'public' },
            include: [
                { model: models_1.User, as: 'student', attributes: ['id', 'name'] },
                { association: 'versions', separate: true, order: [['versionNumber', 'DESC']], limit: 1 },
            ],
        });
        if (!project) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Project not found.');
            return;
        }
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=project.controller.js.map