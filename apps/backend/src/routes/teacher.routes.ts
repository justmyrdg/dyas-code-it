import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  listPublishedTopics,
  createClass,
  listClasses,
  getClass,
  getClassProgress,
  updateClass,
} from '../controllers/class.controller';
import {
  listPendingSubmissions,
  getSubmissionForTeacher,
  gradeSubmission,
} from '../controllers/assessment.controller';
import {
  listSharedProjects,
  getSharedProject,
  leaveVersionFeedback,
} from '../controllers/project.controller';
import { getSubscription, startCheckout } from '../controllers/subscription.controller';
import { getClassIntegrityReport } from '../controllers/integrity.controller';

export const teacherRouter = Router();

teacherRouter.use(requireAuth, requireRole('teacher'));

teacherRouter.get('/topics', listPublishedTopics);
teacherRouter.post('/classes', createClass);
teacherRouter.get('/classes', listClasses);
teacherRouter.get('/classes/:id', getClass);
teacherRouter.get('/classes/:id/progress', getClassProgress);
teacherRouter.patch('/classes/:id', updateClass);

teacherRouter.get('/classes/:classId/grading-queue', listPendingSubmissions);
teacherRouter.get('/classes/:classId/integrity', getClassIntegrityReport);
teacherRouter.get('/submissions/:submissionId', getSubmissionForTeacher);
teacherRouter.patch('/submissions/:submissionId/grade', gradeSubmission);

// Subscription / premium upgrade
teacherRouter.get('/subscription', getSubscription);
teacherRouter.post('/subscription/checkout', startCheckout);

// Practice projects shared by students in this teacher's classes
teacherRouter.get('/projects', listSharedProjects);
teacherRouter.get('/projects/:projectId', getSharedProject);
teacherRouter.patch('/projects/:projectId/versions/:versionId/feedback', leaveVersionFeedback);
