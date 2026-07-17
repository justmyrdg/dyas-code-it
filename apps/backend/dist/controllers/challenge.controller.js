"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallenge = createChallenge;
exports.listChallengesAdmin = listChallengesAdmin;
exports.updateChallenge = updateChallenge;
exports.deleteChallenge = deleteChallenge;
exports.listChallengesForStudent = listChallengesForStudent;
exports.startChallenge = startChallenge;
exports.requestHint = requestHint;
exports.completeChallenge = completeChallenge;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const code_execution_service_1 = require("../services/code-execution.service");
const http_1 = require("../utils/http");
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
// --- Admin: challenge CRUD ---
async function createChallenge(req, res, next) {
    try {
        const { title, description, difficulty, language, starterCode, hints, published } = req.body;
        if (!title?.trim() || !language) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Title and language are required.');
            return;
        }
        if (!code_execution_service_1.SUPPORTED_LANGUAGES.includes(language)) {
            (0, http_1.sendError)(res, 400, 'unsupported_language', `Language must be one of: ${code_execution_service_1.SUPPORTED_LANGUAGES.join(', ')}.`);
            return;
        }
        if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty)) {
            (0, http_1.sendError)(res, 400, 'invalid_difficulty', `Difficulty must be one of: ${DIFFICULTIES.join(', ')}.`);
            return;
        }
        const challenge = await models_1.CodingChallenge.create({
            title: title.trim(),
            description: description ?? '',
            difficulty: difficulty ?? 'beginner',
            language,
            starterCode: starterCode ?? '',
            hints: Array.isArray(hints) ? hints.map(String) : [],
            published: published === true,
            createdBy: req.user.sub,
        });
        res.status(201).json({ challenge });
    }
    catch (err) {
        next(err);
    }
}
async function listChallengesAdmin(_req, res, next) {
    try {
        const challenges = await models_1.CodingChallenge.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ challenges });
    }
    catch (err) {
        next(err);
    }
}
async function updateChallenge(req, res, next) {
    try {
        const challenge = await models_1.CodingChallenge.findByPk(req.params.id);
        if (!challenge) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Challenge not found.');
            return;
        }
        const { title, description, difficulty, language, starterCode, hints, published } = req.body;
        if (title !== undefined) {
            if (!title.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Title cannot be empty.');
                return;
            }
            challenge.title = title.trim();
        }
        if (description !== undefined)
            challenge.description = description;
        if (difficulty !== undefined) {
            if (!DIFFICULTIES.includes(difficulty)) {
                (0, http_1.sendError)(res, 400, 'invalid_difficulty', `Difficulty must be one of: ${DIFFICULTIES.join(', ')}.`);
                return;
            }
            challenge.difficulty = difficulty;
        }
        if (language !== undefined) {
            if (!code_execution_service_1.SUPPORTED_LANGUAGES.includes(language)) {
                (0, http_1.sendError)(res, 400, 'unsupported_language', `Language must be one of: ${code_execution_service_1.SUPPORTED_LANGUAGES.join(', ')}.`);
                return;
            }
            challenge.language = language;
        }
        if (starterCode !== undefined)
            challenge.starterCode = starterCode;
        if (hints !== undefined)
            challenge.hints = Array.isArray(hints) ? hints.map(String) : [];
        if (published !== undefined)
            challenge.published = published === true;
        await challenge.save();
        res.json({ challenge });
    }
    catch (err) {
        next(err);
    }
}
async function deleteChallenge(req, res, next) {
    try {
        const challenge = await models_1.CodingChallenge.findByPk(req.params.id);
        if (!challenge) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Challenge not found.');
            return;
        }
        const inUse = await models_1.PracticeProject.count({ where: { challengeId: challenge.id } });
        if (inUse > 0) {
            // Unpublish instead of breaking student projects that started from it.
            challenge.published = false;
            await challenge.save();
            res.json({ challenge, unpublished: true });
            return;
        }
        await challenge.destroy();
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
// --- Student: browse and attempt published challenges ---
async function listChallengesForStudent(req, res, next) {
    try {
        const challenges = await models_1.CodingChallenge.findAll({
            where: { published: true },
            attributes: ['id', 'title', 'description', 'difficulty', 'language'],
            order: [['difficulty', 'ASC'], ['createdAt', 'DESC']],
        });
        const progress = await models_1.StudentChallengeProgress.findAll({
            where: { studentId: req.user.sub, challengeId: { [sequelize_1.Op.in]: challenges.map((c) => c.id) } },
        });
        res.json({ challenges, progress });
    }
    catch (err) {
        next(err);
    }
}
// Starting a challenge creates a practice project seeded with the starter code
// (or returns the existing one if the student already started it).
async function startChallenge(req, res, next) {
    try {
        const challenge = await models_1.CodingChallenge.findOne({
            where: { id: req.params.id, published: true },
        });
        if (!challenge) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Challenge not found.');
            return;
        }
        const existing = await models_1.StudentChallengeProgress.findOne({
            where: { studentId: req.user.sub, challengeId: challenge.id },
        });
        if (existing) {
            res.json({ projectId: existing.projectId, progress: existing });
            return;
        }
        const project = await models_1.PracticeProject.create({
            studentId: req.user.sub,
            title: challenge.title,
            description: challenge.description,
            language: challenge.language,
            challengeId: challenge.id,
        });
        await models_1.ProjectVersion.create({
            projectId: project.id,
            versionNumber: 1,
            code: challenge.starterCode,
            message: 'Starter code',
            teacherFeedback: null,
        });
        const progress = await models_1.StudentChallengeProgress.create({
            studentId: req.user.sub,
            challengeId: challenge.id,
            projectId: project.id,
        });
        res.status(201).json({ projectId: project.id, progress });
    }
    catch (err) {
        next(err);
    }
}
// Progressive hints: reveals the next unviewed hint and records it.
async function requestHint(req, res, next) {
    try {
        const progress = await models_1.StudentChallengeProgress.findOne({
            where: { studentId: req.user.sub, challengeId: req.params.id },
        });
        if (!progress) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Start the challenge before requesting hints.');
            return;
        }
        const challenge = await models_1.CodingChallenge.findByPk(req.params.id);
        if (!challenge) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Challenge not found.');
            return;
        }
        const nextIndex = progress.viewedHints.length;
        if (nextIndex >= challenge.hints.length) {
            (0, http_1.sendError)(res, 404, 'no_more_hints', 'No more hints available for this challenge.');
            return;
        }
        progress.viewedHints = [...progress.viewedHints, nextIndex];
        await progress.save();
        res.json({ hint: challenge.hints[nextIndex], hintNumber: nextIndex + 1, totalHints: challenge.hints.length });
    }
    catch (err) {
        next(err);
    }
}
async function completeChallenge(req, res, next) {
    try {
        const progress = await models_1.StudentChallengeProgress.findOne({
            where: { studentId: req.user.sub, challengeId: req.params.id },
        });
        if (!progress) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Start the challenge before completing it.');
            return;
        }
        progress.completed = true;
        await progress.save();
        res.json({ progress });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=challenge.controller.js.map