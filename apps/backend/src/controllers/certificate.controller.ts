import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import QRCode from 'qrcode';
import {
  AssessmentSubmission,
  Certificate,
  Chapter,
  ChapterAssessment,
  Class,
  ClassEnrollment,
  Lesson,
  StudentProgress,
  Topic,
  User,
} from '../models';
import { sendError } from '../utils/http';

const APP_URL = process.env.APP_URL || 'http://localhost:4201';

// Certificate codes are unguessable — the verify endpoint is public.
function generateCertificateCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

interface EligibilityResult {
  eligible: boolean;
  totalLessons: number;
  completedLessons: number;
  totalAssessments: number;
  passedAssessments: number;
}

async function checkEligibility(studentId: string, classRow: Class): Promise<EligibilityResult> {
  const chapters = await Chapter.findAll({ where: { topicId: classRow.topicId }, attributes: ['id'] });
  const chapterIds = chapters.map((c) => c.id);

  const lessons = chapterIds.length
    ? await Lesson.findAll({ where: { chapterId: { [Op.in]: chapterIds } }, attributes: ['id'] })
    : [];
  const lessonIds = lessons.map((l) => l.id);

  const completedLessons = lessonIds.length
    ? await StudentProgress.count({
        where: { studentId, classId: classRow.id, lessonId: { [Op.in]: lessonIds }, completed: true },
      })
    : 0;

  const assessments = chapterIds.length
    ? await ChapterAssessment.findAll({ where: { chapterId: { [Op.in]: chapterIds } }, attributes: ['id'] })
    : [];
  const assessmentIds = assessments.map((a) => a.id);

  let passedAssessments = 0;
  if (assessmentIds.length) {
    const passed = await AssessmentSubmission.findAll({
      where: {
        studentId,
        classId: classRow.id,
        assessmentId: { [Op.in]: assessmentIds },
        status: 'passed',
      },
      attributes: ['assessmentId'],
    });
    passedAssessments = new Set(passed.map((p) => p.assessmentId)).size;
  }

  return {
    // A class with no lessons at all can't be "completed".
    eligible:
      lessonIds.length > 0 &&
      completedLessons >= lessonIds.length &&
      passedAssessments >= assessmentIds.length,
    totalLessons: lessonIds.length,
    completedLessons,
    totalAssessments: assessmentIds.length,
    passedAssessments,
  };
}

// --- Student endpoints ---

export async function getCertificateEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollment = await ClassEnrollment.findOne({
      where: { studentId: req.user!.sub, classId: req.params.classId, status: 'active' },
    });
    if (!enrollment) {
      sendError(res, 404, 'not_found', 'You are not enrolled in this class.');
      return;
    }
    const classRow = await Class.findByPk(req.params.classId);
    if (!classRow) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const existing = await Certificate.findOne({
      where: { studentId: req.user!.sub, classId: classRow.id },
    });
    const eligibility = await checkEligibility(req.user!.sub, classRow);
    res.json({ ...eligibility, certificateId: existing?.id ?? null });
  } catch (err) {
    next(err);
  }
}

export async function claimCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollment = await ClassEnrollment.findOne({
      where: { studentId: req.user!.sub, classId: req.params.classId, status: 'active' },
    });
    if (!enrollment) {
      sendError(res, 404, 'not_found', 'You are not enrolled in this class.');
      return;
    }
    const classRow = await Class.findByPk(req.params.classId);
    if (!classRow) {
      sendError(res, 404, 'not_found', 'Class not found.');
      return;
    }
    const existing = await Certificate.findOne({
      where: { studentId: req.user!.sub, classId: classRow.id },
    });
    if (existing) {
      res.json({ certificate: existing });
      return;
    }
    const eligibility = await checkEligibility(req.user!.sub, classRow);
    if (!eligibility.eligible) {
      sendError(
        res,
        403,
        'not_eligible',
        `Complete all lessons (${eligibility.completedLessons}/${eligibility.totalLessons}) and pass all assessments (${eligibility.passedAssessments}/${eligibility.totalAssessments}) first.`,
      );
      return;
    }
    const certificate = await Certificate.create({
      studentId: req.user!.sub,
      classId: classRow.id,
      topicId: classRow.topicId,
      certificateCode: generateCertificateCode(),
      issuedAt: new Date(),
    });
    res.status(201).json({ certificate });
  } catch (err) {
    next(err);
  }
}

export async function listMyCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificates = await Certificate.findAll({
      where: { studentId: req.user!.sub },
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
        { model: Class, as: 'class', attributes: ['id', 'name'] },
      ],
      order: [['issuedAt', 'DESC']],
    });
    res.json({ certificates });
  } catch (err) {
    next(err);
  }
}

export async function getMyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificate = await Certificate.findOne({
      where: { id: req.params.id, studentId: req.user!.sub },
      include: [
        { model: Topic, as: 'topic', attributes: ['id', 'name'] },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          include: [{ association: 'teacher', attributes: ['id', 'name'] }],
        },
        { model: User, as: 'student', attributes: ['id', 'name'] },
      ],
    });
    if (!certificate) {
      sendError(res, 404, 'not_found', 'Certificate not found.');
      return;
    }
    const verifyUrl = `${APP_URL}/verify/${certificate.certificateCode}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220 });
    res.json({ certificate, verifyUrl, qrDataUrl });
  } catch (err) {
    next(err);
  }
}

// --- Public verification (no auth) ---

export async function verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const certificate = await Certificate.findOne({
      where: { certificateCode: req.params.code },
      include: [
        { model: Topic, as: 'topic', attributes: ['name'] },
        {
          model: Class,
          as: 'class',
          attributes: ['name'],
          include: [{ association: 'teacher', attributes: ['name'] }],
        },
        { model: User, as: 'student', attributes: ['name'] },
      ],
    });
    if (!certificate) {
      sendError(res, 404, 'not_found', 'No certificate matches this code.');
      return;
    }
    res.json({
      valid: certificate.status === 'active',
      status: certificate.status,
      studentName: (certificate as Certificate & { student?: { name: string } }).student?.name,
      topicName: (certificate as Certificate & { topic?: { name: string } }).topic?.name,
      className: (certificate as Certificate & { class?: { name: string; teacher?: { name: string } } }).class?.name,
      teacherName: (certificate as Certificate & { class?: { teacher?: { name: string } } }).class?.teacher?.name,
      issuedAt: certificate.issuedAt,
    });
  } catch (err) {
    next(err);
  }
}
