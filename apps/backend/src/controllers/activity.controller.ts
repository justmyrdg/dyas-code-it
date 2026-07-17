import type { NextFunction, Request, Response } from 'express';
import { Lesson, MiniActivity } from '../models';
import { SUPPORTED_LANGUAGES } from '../services/code-execution.service';
import type {
  ActivityType,
  ActivityConfig,
  QuizConfig,
  FillBlankConfig,
  CodeChallengeConfig,
} from '../services/grading.service';
import { sendError } from '../utils/http';

const ACTIVITY_TYPES: ActivityType[] = ['quiz', 'code_challenge', 'fill_blank', 'debug'];

// Validates and normalizes the type-specific config blob. Returns a clean config or an error
// message describing what's wrong. Mirrors the parseCodeExamples pattern in curriculum.controller.
function parseActivityConfig(type: ActivityType, input: unknown): ActivityConfig | string {
  if (typeof input !== 'object' || input === null) {
    return 'config must be an object.';
  }
  const raw = input as Record<string, unknown>;

  if (type === 'quiz') {
    const options = raw.options;
    if (!Array.isArray(options) || options.length < 2 || !options.every((o) => typeof o === 'string')) {
      return 'quiz config needs an options array of at least two strings.';
    }
    const correctIndex = raw.correctIndex;
    if (typeof correctIndex !== 'number' || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
      return 'quiz config needs a correctIndex within the options range.';
    }
    return { options: options as string[], correctIndex } satisfies QuizConfig;
  }

  if (type === 'fill_blank') {
    const answers = raw.answers;
    if (!Array.isArray(answers) || answers.length < 1 || !answers.every((a) => typeof a === 'string')) {
      return 'fill_blank config needs an answers array of at least one string.';
    }
    return { answers: answers as string[] } satisfies FillBlankConfig;
  }

  // code_challenge and debug share the same config shape.
  const language = raw.language;
  if (typeof language !== 'string' || !SUPPORTED_LANGUAGES.includes(language)) {
    return `config.language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}.`;
  }
  const testCases = raw.testCases;
  if (!Array.isArray(testCases) || testCases.length < 1) {
    return 'config needs at least one test case.';
  }
  const cleanCases = [];
  for (const tc of testCases) {
    if (typeof tc !== 'object' || tc === null) return 'each test case must be an object.';
    const { stdin, expectedStdout } = tc as Record<string, unknown>;
    if (typeof stdin !== 'string' || typeof expectedStdout !== 'string') {
      return 'each test case needs string stdin and expectedStdout.';
    }
    cleanCases.push({ stdin, expectedStdout });
  }
  const starterCode = typeof raw.starterCode === 'string' ? raw.starterCode : undefined;
  return { language, starterCode, testCases: cleanCases } satisfies CodeChallengeConfig;
}

export interface StudentActivity {
  id: string;
  type: ActivityType;
  prompt: string;
  position: number;
  config: Record<string, unknown>;
}

// Strips answer keys before an activity is sent to a student: quiz correctIndex, fill_blank
// answers, and code-challenge expected outputs are all withheld.
export function toStudentActivity(activity: MiniActivity): StudentActivity {
  const base = { id: activity.id, type: activity.type, prompt: activity.prompt, position: activity.position };
  if (activity.type === 'quiz') {
    const cfg = activity.config as QuizConfig;
    return { ...base, config: { options: cfg.options } };
  }
  if (activity.type === 'fill_blank') {
    const cfg = activity.config as FillBlankConfig;
    return { ...base, config: { blankCount: cfg.answers.length } };
  }
  const cfg = activity.config as CodeChallengeConfig;
  return {
    ...base,
    config: {
      language: cfg.language,
      starterCode: cfg.starterCode ?? '',
      sampleInputs: cfg.testCases.map((tc) => tc.stdin),
    },
  };
}

export async function createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      sendError(res, 404, 'not_found', 'Lesson not found.');
      return;
    }
    const { type, prompt } = req.body as { type?: string; prompt?: string };
    if (!type || !ACTIVITY_TYPES.includes(type as ActivityType)) {
      sendError(res, 400, 'invalid_type', `type must be one of: ${ACTIVITY_TYPES.join(', ')}.`);
      return;
    }
    if (!prompt?.trim()) {
      sendError(res, 400, 'missing_fields', 'Activity prompt is required.');
      return;
    }
    const config = parseActivityConfig(type as ActivityType, req.body.config);
    if (typeof config === 'string') {
      sendError(res, 400, 'invalid_config', config);
      return;
    }
    const maxPosition = (await MiniActivity.max('position', { where: { lessonId: lesson.id } })) as number | null;
    const activity = await MiniActivity.create({
      lessonId: lesson.id,
      type: type as ActivityType,
      prompt: prompt.trim(),
      position: (maxPosition ?? 0) + 1,
      config,
    });
    res.status(201).json({ activity });
  } catch (err) {
    next(err);
  }
}

export async function updateActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activity = await MiniActivity.findByPk(req.params.id);
    if (!activity) {
      sendError(res, 404, 'not_found', 'Activity not found.');
      return;
    }
    const { prompt, position } = req.body as { prompt?: string; position?: number };
    if (prompt !== undefined) {
      if (!prompt.trim()) {
        sendError(res, 400, 'missing_fields', 'Activity prompt cannot be empty.');
        return;
      }
      activity.prompt = prompt.trim();
    }
    if (position !== undefined) {
      if (!Number.isInteger(position) || position < 1) {
        sendError(res, 400, 'invalid_position', 'Position must be a positive integer.');
        return;
      }
      activity.position = position;
    }
    // The activity type is fixed at creation; only its config can change.
    if (req.body.config !== undefined) {
      const config = parseActivityConfig(activity.type, req.body.config);
      if (typeof config === 'string') {
        sendError(res, 400, 'invalid_config', config);
        return;
      }
      activity.config = config;
    }
    await activity.save();
    res.json({ activity });
  } catch (err) {
    next(err);
  }
}

export async function deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activity = await MiniActivity.findByPk(req.params.id);
    if (!activity) {
      sendError(res, 404, 'not_found', 'Activity not found.');
      return;
    }
    await activity.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
