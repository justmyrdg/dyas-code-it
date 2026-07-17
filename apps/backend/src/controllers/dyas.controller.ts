import type { NextFunction, Request, Response } from 'express';
import { DyasConversation, Lesson, MiniActivity } from '../models';
import type { DyasContextType, DyasMessage } from '../models/DyasConversation';
import { dyasClient, type DyasContext } from '../services/dyas.service';
import { sendError } from '../utils/http';

const CONTEXT_TYPES: DyasContextType[] = ['lesson', 'activity', 'assessment', 'sandbox', 'general'];
const MAX_MESSAGE_LENGTH = 4000;
const CONTEXT_EXCERPT_LENGTH = 1500;

// Builds the "what is the student looking at" summary injected into the system
// prompt. Assessment context deliberately includes NO question content — Dyas is
// restricted to concept help during exams.
async function buildContext(type: DyasContextType, contextId: string | null): Promise<DyasContext> {
  if (type === 'lesson' && contextId) {
    const lesson = await Lesson.findByPk(contextId);
    if (lesson) {
      return {
        type,
        summary: `Lesson "${lesson.title}".\nLesson content excerpt:\n${lesson.content.slice(0, CONTEXT_EXCERPT_LENGTH)}`,
      };
    }
  }
  if (type === 'activity' && contextId) {
    const activity = await MiniActivity.findByPk(contextId);
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

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, conversationId, contextType, contextId } = req.body as {
      message?: string;
      conversationId?: string;
      contextType?: string;
      contextId?: string;
    };

    if (!message?.trim()) {
      sendError(res, 400, 'missing_fields', 'message is required.');
      return;
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      sendError(res, 400, 'message_too_long', `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    const type: DyasContextType = CONTEXT_TYPES.includes(contextType as DyasContextType)
      ? (contextType as DyasContextType)
      : 'general';

    let conversation: DyasConversation | null = null;
    if (conversationId) {
      conversation = await DyasConversation.findOne({
        where: { id: conversationId, studentId: req.user!.sub },
      });
    }
    if (!conversation) {
      conversation = await DyasConversation.create({
        studentId: req.user!.sub,
        contextType: type,
        contextId: contextId ?? null,
      });
    }

    const studentMessage: DyasMessage = {
      role: 'student',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    const history = [...conversation.messages, studentMessage];

    const context = await buildContext(type, contextId ?? conversation.contextId);
    let replyText: string;
    try {
      replyText = await dyasClient.reply(history, context);
    } catch (err) {
      if (err instanceof Error && err.message.includes('CLAUDE_API_KEY')) {
        sendError(res, 503, 'dyas_unavailable', 'Dyas is not configured yet. Ask your administrator to set CLAUDE_API_KEY.');
        return;
      }
      throw err;
    }

    const dyasMessage: DyasMessage = {
      role: 'dyas',
      content: replyText,
      timestamp: new Date().toISOString(),
    };
    conversation.messages = [...history, dyasMessage];
    await conversation.save();

    res.json({ conversationId: conversation.id, reply: dyasMessage });
  } catch (err) {
    next(err);
  }
}

export async function listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conversations = await DyasConversation.findAll({
      where: { studentId: req.user!.sub },
      attributes: ['id', 'contextType', 'contextId', 'updatedAt'],
      order: [['updatedAt', 'DESC']],
      limit: 20,
    });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const conversation = await DyasConversation.findOne({
      where: { id: req.params.id, studentId: req.user!.sub },
    });
    if (!conversation) {
      sendError(res, 404, 'not_found', 'Conversation not found.');
      return;
    }
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}
