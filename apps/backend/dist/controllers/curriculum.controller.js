"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopic = createTopic;
exports.listTopics = listTopics;
exports.getTopic = getTopic;
exports.updateTopic = updateTopic;
exports.deleteTopic = deleteTopic;
exports.createChapter = createChapter;
exports.updateChapter = updateChapter;
exports.deleteChapter = deleteChapter;
exports.createLesson = createLesson;
exports.updateLesson = updateLesson;
exports.deleteLesson = deleteLesson;
const models_1 = require("../models");
const http_1 = require("../utils/http");
function parseCodeExamples(input) {
    if (input === undefined)
        return [];
    if (!Array.isArray(input))
        return null;
    const examples = [];
    for (const item of input) {
        if (typeof item !== 'object' ||
            item === null ||
            typeof item.language !== 'string' ||
            typeof item.code !== 'string') {
            return null;
        }
        const ex = item;
        examples.push({
            language: ex.language,
            code: ex.code,
            description: typeof ex.description === 'string' ? ex.description : '',
            expectedOutput: typeof ex.expectedOutput === 'string' ? ex.expectedOutput : '',
        });
    }
    return examples;
}
// --- Topics ---
async function createTopic(req, res, next) {
    try {
        const { name, description } = req.body;
        if (!name?.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Topic name is required.');
            return;
        }
        const topic = await models_1.Topic.create({
            name: name.trim(),
            description: description ?? null,
            adminId: req.user.sub,
        });
        res.status(201).json({ topic });
    }
    catch (err) {
        next(err);
    }
}
async function listTopics(_req, res, next) {
    try {
        const topics = await models_1.Topic.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ topics });
    }
    catch (err) {
        next(err);
    }
}
async function getTopic(req, res, next) {
    try {
        const topic = await models_1.Topic.findByPk(req.params.id, {
            include: [
                {
                    model: models_1.Chapter,
                    as: 'chapters',
                    include: [
                        {
                            model: models_1.Lesson,
                            as: 'lessons',
                            include: [{ model: models_1.MiniActivity, as: 'activities' }],
                        },
                        { model: models_1.ChapterAssessment, as: 'assessments' },
                    ],
                },
            ],
            order: [
                [{ model: models_1.Chapter, as: 'chapters' }, 'position', 'ASC'],
                [{ model: models_1.Chapter, as: 'chapters' }, { model: models_1.Lesson, as: 'lessons' }, 'position', 'ASC'],
                [
                    { model: models_1.Chapter, as: 'chapters' },
                    { model: models_1.Lesson, as: 'lessons' },
                    { model: models_1.MiniActivity, as: 'activities' },
                    'position',
                    'ASC',
                ],
            ],
        });
        if (!topic) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Topic not found.');
            return;
        }
        res.json({ topic });
    }
    catch (err) {
        next(err);
    }
}
async function updateTopic(req, res, next) {
    try {
        const topic = await models_1.Topic.findByPk(req.params.id);
        if (!topic) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Topic not found.');
            return;
        }
        const { name, description, status } = req.body;
        if (name !== undefined) {
            if (!name.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Topic name cannot be empty.');
                return;
            }
            topic.name = name.trim();
        }
        if (description !== undefined)
            topic.description = description;
        if (status !== undefined) {
            if (status !== 'draft' && status !== 'published' && status !== 'archived') {
                (0, http_1.sendError)(res, 400, 'invalid_status', 'Status must be draft, published, or archived.');
                return;
            }
            topic.status = status;
        }
        await topic.save();
        res.json({ topic });
    }
    catch (err) {
        next(err);
    }
}
async function deleteTopic(req, res, next) {
    try {
        const topic = await models_1.Topic.findByPk(req.params.id);
        if (!topic) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Topic not found.');
            return;
        }
        const classCount = await models_1.Class.count({ where: { topicId: topic.id } });
        if (classCount > 0) {
            (0, http_1.sendError)(res, 409, 'topic_in_use', 'Cannot delete a topic that has classes. Archive it instead.');
            return;
        }
        await topic.destroy();
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
// --- Chapters ---
async function createChapter(req, res, next) {
    try {
        const topic = await models_1.Topic.findByPk(req.params.topicId);
        if (!topic) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Topic not found.');
            return;
        }
        const { title, description } = req.body;
        if (!title?.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Chapter title is required.');
            return;
        }
        const maxPosition = (await models_1.Chapter.max('position', { where: { topicId: topic.id } }));
        const chapter = await models_1.Chapter.create({
            topicId: topic.id,
            title: title.trim(),
            description: description ?? null,
            position: (maxPosition ?? 0) + 1,
        });
        res.status(201).json({ chapter });
    }
    catch (err) {
        next(err);
    }
}
async function updateChapter(req, res, next) {
    try {
        const chapter = await models_1.Chapter.findByPk(req.params.id);
        if (!chapter) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Chapter not found.');
            return;
        }
        const { title, description, position } = req.body;
        if (title !== undefined) {
            if (!title.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Chapter title cannot be empty.');
                return;
            }
            chapter.title = title.trim();
        }
        if (description !== undefined)
            chapter.description = description;
        if (position !== undefined) {
            if (!Number.isInteger(position) || position < 1) {
                (0, http_1.sendError)(res, 400, 'invalid_position', 'Position must be a positive integer.');
                return;
            }
            chapter.position = position;
        }
        await chapter.save();
        res.json({ chapter });
    }
    catch (err) {
        next(err);
    }
}
async function deleteChapter(req, res, next) {
    try {
        const chapter = await models_1.Chapter.findByPk(req.params.id);
        if (!chapter) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Chapter not found.');
            return;
        }
        await chapter.destroy();
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
// --- Lessons ---
async function createLesson(req, res, next) {
    try {
        const chapter = await models_1.Chapter.findByPk(req.params.chapterId);
        if (!chapter) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Chapter not found.');
            return;
        }
        const { title, content, learningObjectives } = req.body;
        if (!title?.trim() || !content?.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Lesson title and content are required.');
            return;
        }
        const codeExamples = parseCodeExamples(req.body.codeExamples);
        if (codeExamples === null) {
            (0, http_1.sendError)(res, 400, 'invalid_code_examples', 'Code examples must be a list of {language, code} objects.');
            return;
        }
        const maxPosition = (await models_1.Lesson.max('position', { where: { chapterId: chapter.id } }));
        const lesson = await models_1.Lesson.create({
            chapterId: chapter.id,
            title: title.trim(),
            content,
            learningObjectives: learningObjectives ?? null,
            position: (maxPosition ?? 0) + 1,
            codeExamples,
        });
        res.status(201).json({ lesson });
    }
    catch (err) {
        next(err);
    }
}
async function updateLesson(req, res, next) {
    try {
        const lesson = await models_1.Lesson.findByPk(req.params.id);
        if (!lesson) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Lesson not found.');
            return;
        }
        const { title, content, learningObjectives, position } = req.body;
        if (title !== undefined) {
            if (!title.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Lesson title cannot be empty.');
                return;
            }
            lesson.title = title.trim();
        }
        if (content !== undefined) {
            if (!content.trim()) {
                (0, http_1.sendError)(res, 400, 'missing_fields', 'Lesson content cannot be empty.');
                return;
            }
            lesson.content = content;
        }
        if (learningObjectives !== undefined)
            lesson.learningObjectives = learningObjectives;
        if (position !== undefined) {
            if (!Number.isInteger(position) || position < 1) {
                (0, http_1.sendError)(res, 400, 'invalid_position', 'Position must be a positive integer.');
                return;
            }
            lesson.position = position;
        }
        if (req.body.codeExamples !== undefined) {
            const codeExamples = parseCodeExamples(req.body.codeExamples);
            if (codeExamples === null) {
                (0, http_1.sendError)(res, 400, 'invalid_code_examples', 'Code examples must be a list of {language, code} objects.');
                return;
            }
            lesson.codeExamples = codeExamples;
        }
        await lesson.save();
        res.json({ lesson });
    }
    catch (err) {
        next(err);
    }
}
async function deleteLesson(req, res, next) {
    try {
        const lesson = await models_1.Lesson.findByPk(req.params.id);
        if (!lesson) {
            (0, http_1.sendError)(res, 404, 'not_found', 'Lesson not found.');
            return;
        }
        await lesson.destroy();
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=curriculum.controller.js.map