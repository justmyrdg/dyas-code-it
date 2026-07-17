import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  joinClass,
  listMyClasses,
  getClassCurriculum,
  getLesson,
  completeLesson,
  submitActivity,
} from '../controllers/student.controller';
import {
  getAssessmentForStudent,
  submitAssessment,
} from '../controllers/assessment.controller';
import {
  listMyProjects,
  createProject,
  getMyProject,
  updateMyProject,
  deleteMyProject,
  saveVersion,
  restoreVersion,
} from '../controllers/project.controller';
import {
  listChallengesForStudent,
  startChallenge,
  requestHint,
  completeChallenge,
} from '../controllers/challenge.controller';
import {
  getCertificateEligibility,
  claimCertificate,
  listMyCertificates,
  getMyCertificate,
} from '../controllers/certificate.controller';
import { chat, listConversations, getConversation } from '../controllers/dyas.controller';
import rateLimit from 'express-rate-limit';
import { DYAS_RATE_PER_MIN } from '../config/limits';

export const studentRouter = Router();

studentRouter.use(requireAuth, requireRole('student'));

studentRouter.post('/enrollments', joinClass);
studentRouter.get('/classes', listMyClasses);
studentRouter.get('/classes/:classId', getClassCurriculum);
studentRouter.get('/classes/:classId/lessons/:lessonId', getLesson);
studentRouter.post('/classes/:classId/lessons/:lessonId/complete', completeLesson);
studentRouter.post('/classes/:classId/activities/:activityId/submit', submitActivity);
studentRouter.get('/classes/:classId/assessments/:assessmentId', getAssessmentForStudent);
studentRouter.post('/classes/:classId/assessments/:assessmentId/submit', submitAssessment);

// Practice sandbox
studentRouter.get('/projects', listMyProjects);
studentRouter.post('/projects', createProject);
studentRouter.get('/projects/:projectId', getMyProject);
studentRouter.patch('/projects/:projectId', updateMyProject);
studentRouter.delete('/projects/:projectId', deleteMyProject);
studentRouter.post('/projects/:projectId/versions', saveVersion);
studentRouter.post('/projects/:projectId/versions/:versionId/restore', restoreVersion);

// Guided challenges
studentRouter.get('/challenges', listChallengesForStudent);
studentRouter.post('/challenges/:id/start', startChallenge);
studentRouter.post('/challenges/:id/hint', requestHint);
studentRouter.post('/challenges/:id/complete', completeChallenge);

// Certificates
studentRouter.get('/classes/:classId/certificate-eligibility', getCertificateEligibility);
studentRouter.post('/classes/:classId/certificate', claimCertificate);
studentRouter.get('/certificates', listMyCertificates);
studentRouter.get('/certificates/:id', getMyCertificate);

// Dyas AI assistant — each message is a paid Claude call, so rate-limit per user.
const dyasLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: DYAS_RATE_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'anonymous',
  handler: (req, res) => {
    res.status(429).json({
      error: { code: 'rate_limited', message: 'Dyas needs a short break. Try again in a minute.' },
    });
  },
});
studentRouter.post('/dyas/chat', dyasLimiter, chat);
studentRouter.get('/dyas/conversations', listConversations);
studentRouter.get('/dyas/conversations/:id', getConversation);
