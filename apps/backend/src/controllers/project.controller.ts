import type { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import {
  Class,
  ClassEnrollment,
  PracticeProject,
  ProjectVersion,
  User,
} from '../models';
import { SUPPORTED_LANGUAGES } from '../services/code-execution.service';
import { sendError } from '../utils/http';

const VISIBILITIES = ['private', 'shared_with_teacher', 'public'] as const;

// --- Student: own projects ---

export async function listMyProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await PracticeProject.findAll({
      where: { studentId: req.user!.sub },
      order: [['updatedAt', 'DESC']],
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, language } = req.body as {
      title?: string;
      description?: string;
      language?: string;
    };
    if (!title?.trim() || !language) {
      sendError(res, 400, 'missing_fields', 'Title and language are required.');
      return;
    }
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      sendError(res, 400, 'unsupported_language', `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}.`);
      return;
    }
    const project = await PracticeProject.create({
      studentId: req.user!.sub,
      title: title.trim(),
      description: description ?? '',
      language,
      challengeId: null,
    });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

export async function getMyProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await PracticeProject.findOne({
      where: { id: req.params.projectId, studentId: req.user!.sub },
      include: [{ association: 'versions', separate: true, order: [['versionNumber', 'DESC']] }],
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await PracticeProject.findOne({
      where: { id: req.params.projectId, studentId: req.user!.sub },
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    const { title, description, visibility } = req.body as {
      title?: string;
      description?: string;
      visibility?: string;
    };
    if (title !== undefined) {
      if (!title.trim()) {
        sendError(res, 400, 'missing_fields', 'Title cannot be empty.');
        return;
      }
      project.title = title.trim();
    }
    if (description !== undefined) project.description = description;
    if (visibility !== undefined) {
      if (!(VISIBILITIES as readonly string[]).includes(visibility)) {
        sendError(res, 400, 'invalid_visibility', `Visibility must be one of: ${VISIBILITIES.join(', ')}.`);
        return;
      }
      project.visibility = visibility as (typeof VISIBILITIES)[number];
    }
    await project.save();
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function deleteMyProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await PracticeProject.findOne({
      where: { id: req.params.projectId, studentId: req.user!.sub },
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    await ProjectVersion.destroy({ where: { projectId: project.id } });
    await project.destroy();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function saveVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await PracticeProject.findOne({
      where: { id: req.params.projectId, studentId: req.user!.sub },
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    const { code, message } = req.body as { code?: string; message?: string };
    if (typeof code !== 'string') {
      sendError(res, 400, 'missing_fields', 'code is required.');
      return;
    }
    const latest = await ProjectVersion.findOne({
      where: { projectId: project.id },
      order: [['versionNumber', 'DESC']],
    });
    const version = await ProjectVersion.create({
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
  } catch (err) {
    next(err);
  }
}

// Restoring creates a NEW version with the old code — history is never rewritten.
export async function restoreVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await PracticeProject.findOne({
      where: { id: req.params.projectId, studentId: req.user!.sub },
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    const source = await ProjectVersion.findOne({
      where: { id: req.params.versionId, projectId: project.id },
    });
    if (!source) {
      sendError(res, 404, 'not_found', 'Version not found.');
      return;
    }
    const latest = await ProjectVersion.findOne({
      where: { projectId: project.id },
      order: [['versionNumber', 'DESC']],
    });
    const version = await ProjectVersion.create({
      projectId: project.id,
      versionNumber: (latest?.versionNumber ?? 0) + 1,
      code: source.code,
      message: `Restored from v${source.versionNumber}`,
      teacherFeedback: null,
    });
    res.status(201).json({ version });
  } catch (err) {
    next(err);
  }
}

// --- Teacher: projects shared by students in their classes ---

async function studentIdsInTeacherClasses(teacherId: string): Promise<string[]> {
  const classes = await Class.findAll({ where: { teacherId }, attributes: ['id'] });
  if (!classes.length) return [];
  const enrollments = await ClassEnrollment.findAll({
    where: { classId: { [Op.in]: classes.map((c) => c.id) }, status: 'active' },
    attributes: ['studentId'],
  });
  return [...new Set(enrollments.map((e) => e.studentId))];
}

export async function listSharedProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentIds = await studentIdsInTeacherClasses(req.user!.sub);
    if (!studentIds.length) {
      res.json({ projects: [] });
      return;
    }
    const projects = await PracticeProject.findAll({
      where: {
        studentId: { [Op.in]: studentIds },
        visibility: { [Op.in]: ['shared_with_teacher', 'public'] },
      },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      order: [['updatedAt', 'DESC']],
    });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

export async function getSharedProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentIds = await studentIdsInTeacherClasses(req.user!.sub);
    const project = await PracticeProject.findOne({
      where: {
        id: req.params.projectId,
        studentId: { [Op.in]: studentIds },
        visibility: { [Op.in]: ['shared_with_teacher', 'public'] },
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { association: 'versions', separate: true, order: [['versionNumber', 'DESC']] },
      ],
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function leaveVersionFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentIds = await studentIdsInTeacherClasses(req.user!.sub);
    const project = await PracticeProject.findOne({
      where: {
        id: req.params.projectId,
        studentId: { [Op.in]: studentIds },
        visibility: { [Op.in]: ['shared_with_teacher', 'public'] },
      },
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    const version = await ProjectVersion.findOne({
      where: { id: req.params.versionId, projectId: project.id },
    });
    if (!version) {
      sendError(res, 404, 'not_found', 'Version not found.');
      return;
    }
    const { feedback } = req.body as { feedback?: string };
    if (typeof feedback !== 'string' || !feedback.trim()) {
      sendError(res, 400, 'missing_fields', 'feedback is required.');
      return;
    }
    version.teacherFeedback = feedback.trim();
    await version.save();
    res.json({ version });
  } catch (err) {
    next(err);
  }
}

// --- Public: view a public project by id (portfolio share link) ---

export async function getPublicProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await PracticeProject.findOne({
      where: { id: req.params.projectId, visibility: 'public' },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name'] },
        { association: 'versions', separate: true, order: [['versionNumber', 'DESC']], limit: 1 },
      ],
    });
    if (!project) {
      sendError(res, 404, 'not_found', 'Project not found.');
      return;
    }
    res.json({ project });
  } catch (err) {
    next(err);
  }
}
