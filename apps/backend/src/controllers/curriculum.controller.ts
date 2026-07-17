import type { NextFunction, Request, Response } from 'express';
import { Topic, Chapter, Lesson, Class, MiniActivity, ChapterAssessment } from '../models';
import type { CodeExample } from '../models/Lesson';
import { sendError } from '../utils/http';

function parseCodeExamples(input: unknown): CodeExample[] | null {
  if (input === undefined) return [];
  if (!Array.isArray(input)) return null;
  const examples: CodeExample[] = [];
  for (const item of input) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as CodeExample).language !== 'string' ||
      typeof (item as CodeExample).code !== 'string'
    ) {
      return null;
    }
    const ex = item as CodeExample;
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

export async function createTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name?.trim()) {
      sendError(res, 400, 'missing_fields', 'Topic name is required.');
      return;
    }
    const topic = await Topic.create({
      name: name.trim(),
      description: description ?? null,
      adminId: req.user!.sub,
    });
    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
}

export async function listTopics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topics = await Topic.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ topics });
  } catch (err) {
    next(err);
  }
}

export async function getTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topic = await Topic.findByPk(req.params.id, {
      include: [
        {
          model: Chapter,
          as: 'chapters',
          include: [
            {
              model: Lesson,
              as: 'lessons',
              include: [{ model: MiniActivity, as: 'activities' }],
            },
            { model: ChapterAssessment, as: 'assessments' },
          ],
        },
      ],
      order: [
        [{ model: Chapter, as: 'chapters' }, 'position', 'ASC'],
        [{ model: Chapter, as: 'chapters' }, { model: Lesson, as: 'lessons' }, 'position', 'ASC'],
        [
          { model: Chapter, as: 'chapters' },
          { model: Lesson, as: 'lessons' },
          { model: MiniActivity, as: 'activities' },
          'position',
          'ASC',
        ],
      ],
    });
    if (!topic) {
      sendError(res, 404, 'not_found', 'Topic not found.');
      return;
    }
    res.json({ topic });
  } catch (err) {
    next(err);
  }
}

export async function updateTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) {
      sendError(res, 404, 'not_found', 'Topic not found.');
      return;
    }
    const { name, description, status } = req.body as {
      name?: string;
      description?: string | null;
      status?: string;
    };
    if (name !== undefined) {
      if (!name.trim()) {
        sendError(res, 400, 'missing_fields', 'Topic name cannot be empty.');
        return;
      }
      topic.name = name.trim();
    }
    if (description !== undefined) topic.description = description;
    if (status !== undefined) {
      if (status !== 'draft' && status !== 'published' && status !== 'archived') {
        sendError(res, 400, 'invalid_status', 'Status must be draft, published, or archived.');
        return;
      }
      topic.status = status;
    }
    await topic.save();
    res.json({ topic });
  } catch (err) {
    next(err);
  }
}

export async function deleteTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) {
      sendError(res, 404, 'not_found', 'Topic not found.');
      return;
    }
    const classCount = await Class.count({ where: { topicId: topic.id } });
    if (classCount > 0) {
      sendError(res, 409, 'topic_in_use', 'Cannot delete a topic that has classes. Archive it instead.');
      return;
    }
    await topic.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// --- Chapters ---

export async function createChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const topic = await Topic.findByPk(req.params.topicId);
    if (!topic) {
      sendError(res, 404, 'not_found', 'Topic not found.');
      return;
    }
    const { title, description } = req.body as { title?: string; description?: string };
    if (!title?.trim()) {
      sendError(res, 400, 'missing_fields', 'Chapter title is required.');
      return;
    }
    const maxPosition = (await Chapter.max('position', { where: { topicId: topic.id } })) as number | null;
    const chapter = await Chapter.create({
      topicId: topic.id,
      title: title.trim(),
      description: description ?? null,
      position: (maxPosition ?? 0) + 1,
    });
    res.status(201).json({ chapter });
  } catch (err) {
    next(err);
  }
}

export async function updateChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) {
      sendError(res, 404, 'not_found', 'Chapter not found.');
      return;
    }
    const { title, description, position } = req.body as {
      title?: string;
      description?: string | null;
      position?: number;
    };
    if (title !== undefined) {
      if (!title.trim()) {
        sendError(res, 400, 'missing_fields', 'Chapter title cannot be empty.');
        return;
      }
      chapter.title = title.trim();
    }
    if (description !== undefined) chapter.description = description;
    if (position !== undefined) {
      if (!Number.isInteger(position) || position < 1) {
        sendError(res, 400, 'invalid_position', 'Position must be a positive integer.');
        return;
      }
      chapter.position = position;
    }
    await chapter.save();
    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

export async function deleteChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) {
      sendError(res, 404, 'not_found', 'Chapter not found.');
      return;
    }
    await chapter.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// --- Lessons ---

export async function createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) {
      sendError(res, 404, 'not_found', 'Chapter not found.');
      return;
    }
    const { title, content, learningObjectives } = req.body as {
      title?: string;
      content?: string;
      learningObjectives?: string;
    };
    if (!title?.trim() || !content?.trim()) {
      sendError(res, 400, 'missing_fields', 'Lesson title and content are required.');
      return;
    }
    const codeExamples = parseCodeExamples(req.body.codeExamples);
    if (codeExamples === null) {
      sendError(res, 400, 'invalid_code_examples', 'Code examples must be a list of {language, code} objects.');
      return;
    }
    const maxPosition = (await Lesson.max('position', { where: { chapterId: chapter.id } })) as number | null;
    const lesson = await Lesson.create({
      chapterId: chapter.id,
      title: title.trim(),
      content,
      learningObjectives: learningObjectives ?? null,
      position: (maxPosition ?? 0) + 1,
      codeExamples,
    });
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
}

export async function updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      sendError(res, 404, 'not_found', 'Lesson not found.');
      return;
    }
    const { title, content, learningObjectives, position } = req.body as {
      title?: string;
      content?: string;
      learningObjectives?: string | null;
      position?: number;
    };
    if (title !== undefined) {
      if (!title.trim()) {
        sendError(res, 400, 'missing_fields', 'Lesson title cannot be empty.');
        return;
      }
      lesson.title = title.trim();
    }
    if (content !== undefined) {
      if (!content.trim()) {
        sendError(res, 400, 'missing_fields', 'Lesson content cannot be empty.');
        return;
      }
      lesson.content = content;
    }
    if (learningObjectives !== undefined) lesson.learningObjectives = learningObjectives;
    if (position !== undefined) {
      if (!Number.isInteger(position) || position < 1) {
        sendError(res, 400, 'invalid_position', 'Position must be a positive integer.');
        return;
      }
      lesson.position = position;
    }
    if (req.body.codeExamples !== undefined) {
      const codeExamples = parseCodeExamples(req.body.codeExamples);
      if (codeExamples === null) {
        sendError(res, 400, 'invalid_code_examples', 'Code examples must be a list of {language, code} objects.');
        return;
      }
      lesson.codeExamples = codeExamples;
    }
    await lesson.save();
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
}

export async function deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      sendError(res, 404, 'not_found', 'Lesson not found.');
      return;
    }
    await lesson.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
