"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = chat;
exports.listConversations = listConversations;
exports.getConversation = getConversation;
const models_1 = require("../models");
const dyas_service_1 = require("../services/dyas.service");
const http_1 = require("../utils/http");
const CONTEXT_TYPES = ['lesson', 'activity', 'assessment', 'sandbox', 'general'];
const MAX_MESSAGE_LENGTH = 4000;
const CONTEXT_EXCERPT_LENGTH = 1500;
// Builds the "what is the student looking at" summary injected into the system
// prompt. Assessment context deliberately includes NO question content — Dyas is
// restricted to concept help during exams.
async function buildContext(type, contextId) {
    if (type === 'lesson' && contextId) {
        const lesson = await models_1.Lesson.findByPk(contextId);
        if (lesson) {
            return {
                type,
                summary: `Lesson "${lesson.title}".\nLesson content excerpt:\n${lesson.content.slice(0, CONTEXT_EXCERPT_LENGTH)}`,
            };
        }
    }
    if (type === 'activity' && contextId) {
        const activity = await models_1.MiniActivity.findByPk(contextId);
        if (activity) {
            return { type, summary: `A ${activity.type} mini-activity: "${activity.prompt}"` };
        }
    }
    if (type === 'assessment') {
        return { type, summary: 'A graded chapter assessment (question details are withheld on purpose).' };
    }
    if (type === 'sandbox') {
        return { type, summary: 'Their own practice project in the coding sandbox.' };
    }
    return { type: 'general', summary: '' };
}
async function chat(req, res, next) {
    try {
        const { message, conversationId, contextType, contextId } = req.body;
        if (!message?.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'message is required.');
            return;
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            (0, http_1.sendError)(res, 400, 'message_too_long', `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }
        const type = CONTEXT_TYPES.includes(contextType)
            ? contextType
            : 'general';
        let conversation = null;
        if (conversationId) {
            conversation = await models_1.DyasConversation.findOne({
                where: { id: conversationId, studentId: req.user.sub },
            });
        }
        if (!conversation) {
            conversation = await models_1.DyasConversation.create({
                studentId: req.user.sub,
                contextType: type,
                contextId: contextId ?? null,
            });
        }
        const studentMessage = {
            role: 'student',
            content: message.trim(),
            timestamp: new Date().toISOString(),
        };
        const history = [...conversation.messages, studentMessage];
        const context = await buildContext(type, contextId ?? conversation.contextId);
        let replyText;
        try {
            replyText = await dyas_service_1.dyasClient.reply(history, context);
        }
        catch (err) {
            if (err instanceof Error && err.message.includes('CLAUDE_API_KEY')) {
                (0, http_1.sendError)(res, 503, 'dyas_unavailable', 'Dyas is not configured yet. Ask your administrator to set CLAUDE_API_KEY.');
                return;
            }
            throw err;
        }
        const dyasMessage = {
            role: 'dyas',
            content: replyText,
            timestamp: new Date().toISOString(),
        };
        conversation.messages = [...history, dyasMessage];
        await conversation.save();
        res.json({ conversationId: conversation.id, reply: dyasMessage });
    }
    catch (err) {
        next(err);
    }
}
async function listConversations(req, res, next) {
    try {
        const conversations = await models_1.DyasConversation.findAll({
            where: { studentId: req.user.sub },
            attributes: ['id', 'contextType', 'contextId', 'updatedAt'],
            order: [['updatedAt', 'DESC']],
            limit: 20,
        });
        res.json({ conversations });
    }
    catch (err) {
        next(err);
    }
}
async function getConversation(req, res, next) {
    try {
        const conversation = await models_1.DyasConversation.findOne({
            where: { id: req.params.id, studentId: req.user.sub },
        });
        if (!conversation) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Conversation not found.');
            return;
        }
        res.json({ conversation });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=dyas.controller.js.map