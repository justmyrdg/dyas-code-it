import type { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { CodingChallenge, PracticeProject, ProjectVersion, StudentChallengeProgress } from '../models';
import { SUPPORTED_LANGUAGES } from '../services/code-execution.service';
import { sendError } from '../utils/http';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

// --- Admin: challenge CRUD ---

export async function createChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, difficulty, language, starterCode, hints, published } = req.body as {
      title?: string;
      description?: string;
      difficulty?: string;
      language?: string;
      starterCode?: string;
      hints?: unknown;
      published?: boolean;
    };
    if (!title?.trim() || !language) {
      sendError(res, 400, 'missing_fields', 'Title and language are required.');
      return;
    }
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      sendError(res, 400, 'unsupported_language', `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}.`);
      return;
    }
    if (difficulty !== undefined && !(DIFFICULTIES as readonly string[]).includes(difficulty)) {
      sendError(res, 400, 'invalid_difficulty', `Difficulty must be one of: ${DIFFICULTIES.join(', ')}.`);
      return;
    }
    const challenge = await CodingChallenge.create({
      title: title.trim(),
      description: description ?? '',
      difficulty: (difficulty as (typeof DIFFICULTIES)[number]) ?? 'beginner',
      language,
      starterCode: starterCode ?? '',
      hints: Array.isArray(hints) ? hints.map(String) : [],
      published: published === true,
      createdBy: req.user!.sub,
    });
    res.status(201).json({ challenge });
  } catch (err) {
    next(err);
  }
}

export async function listChallengesAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenges = await CodingChallenge.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ challenges });
  } catch (err) {
    next(err);
  }
}

export async function updateChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenge = await CodingChallenge.findByPk(req.params.id);
    if (!challenge) {
      sendError(res, 404, 'not_found', 'Challenge not found.');
      return;
    }
    const { title, description, difficulty, language, starterCode, hints, published } = req.body as {
      title?: string;
      description?: string;
      difficulty?: string;
      language?: string;
      starterCode?: string;
      hints?: unknown;
      published?: boolean;
    };
    if (title !== undefined) {
      if (!title.trim()) {
        sendError(res, 400, 'missing_fields', 'Title cannot be empty.');
        return;
      }
      challenge.title = title.trim();
    }
    if (description !== undefined) challenge.description = description;
    if (difficulty !== undefined) {
      if (!(DIFFICULTIES as readonly string[]).includes(difficulty)) {
        sendError(res, 400, 'invalid_difficulty', `Difficulty must be one of: ${DIFFICULTIES.join(', ')}.`);
        return;
      }
      challenge.difficulty = difficulty as (typeof DIFFICULTIES)[number];
    }
    if (language !== undefined) {
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        sendError(res, 400, 'unsupported_language', `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}.`);
        return;
      }
      challenge.language = language;
    }
    if (starterCode !== undefined) challenge.starterCode = starterCode;
    if (hints !== undefined) challenge.hints = Array.isArray(hints) ? hints.map(String) : [];
    if (published !== undefined) challenge.published = published === true;
    await challenge.save();
    res.json({ challenge });
  } catch (err) {
    next(err);
  }
}

export async function deleteChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenge = await CodingChallenge.findByPk(req.params.id);
    if (!challenge) {
      sendError(res, 404, 'not_found', 'Challenge not found.');
      return;
    }
    const inUse = await PracticeProject.count({ where: { challengeId: challenge.id } });
    if (inUse > 0) {
      // Unpublish instead of breaking student projects that started from it.
      challenge.published = false;
      await challenge.save();
      res.json({ challenge, unpublished: true });
      return;
    }
    await challenge.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// --- Student: browse and attempt published challenges ---

export async function listChallengesForStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenges = await CodingChallenge.findAll({
      where: { published: true },
      attributes: ['id', 'title', 'description', 'difficulty', 'language'],
      order: [['difficulty', 'ASC'], ['createdAt', 'DESC']],
    });
    const progress = await StudentChallengeProgress.findAll({
      where: { studentId: req.user!.sub, challengeId: { [Op.in]: challenges.map((c) => c.id) } },
    });
    res.json({ challenges, progress });
  } catch (err) {
    next(err);
  }
}

// Starting a challenge creates a practice project seeded with the starter code
// (or returns the existing one if the student already started it).
export async function startChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenge = await CodingChallenge.findOne({
      where: { id: req.params.id, published: true },
    });
    if (!challenge) {
      sendError(res, 404, 'not_found', 'Challenge not found.');
      return;
    }
    const existing = await StudentChallengeProgress.findOne({
      where: { studentId: req.user!.sub, challengeId: challenge.id },
    });
    if (existing) {
      res.json({ projectId: existing.projectId, progress: existing });
      return;
    }
    const project = await PracticeProject.create({
      studentId: req.user!.sub,
      title: challenge.title,
      description: challenge.description,
      language: challenge.language,
      challengeId: challenge.id,
    });
    await ProjectVersion.create({
      projectId: project.id,
      versionNumber: 1,
      code: challenge.starterCode,
      message: 'Starter code',
      teacherFeedback: null,
    });
    const progress = await StudentChallengeProgress.create({
      studentId: req.user!.sub,
      challengeId: challenge.id,
      projectId: project.id,
    });
    res.status(201).json({ projectId: project.id, progress });
  } catch (err) {
    next(err);
  }
}

// Progressive hints: reveals the next unviewed hint and records it.
export async function requestHint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const progress = await StudentChallengeProgress.findOne({
      where: { studentId: req.user!.sub, challengeId: req.params.id },
    });
    if (!progress) {
      sendError(res, 404, 'not_found', 'Start the challenge before requesting hints.');
      return;
    }
    const challenge = await CodingChallenge.findByPk(req.params.id);
    if (!challenge) {
      sendError(res, 404, 'not_found', 'Challenge not found.');
      return;
    }
    const nextIndex = progress.viewedHints.length;
    if (nextIndex >= challenge.hints.length) {
      sendError(res, 404, 'no_more_hints', 'No more hints available for this challenge.');
      return;
    }
    progress.viewedHints = [...progress.viewedHints, nextIndex];
    await progress.save();
    res.json({ hint: challenge.hints[nextIndex], hintNumber: nextIndex + 1, totalHints: challenge.hints.length });
  } catch (err) {
    next(err);
  }
}

export async function completeChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const progress = await StudentChallengeProgress.findOne({
      where: { studentId: req.user!.sub, challengeId: req.params.id },
    });
    if (!progress) {
      sendError(res, 404, 'not_found', 'Start the challenge before completing it.');
      return;
    }
    progress.completed = true;
    await progress.save();
    res.json({ progress });
  } catch (err) {
    next(err);
  }
}
