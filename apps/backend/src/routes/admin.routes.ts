import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/curriculum.controller';
import {
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activity.controller';
import {
  createAssessment,
  updateAssessment,
  deleteAssessment,
} from '../controllers/assessment.controller';
import {
  createChallenge,
  listChallengesAdmin,
  updateChallenge,
  deleteChallenge,
} from '../controllers/challenge.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.post('/topics', createTopic);
adminRouter.get('/topics', listTopics);
adminRouter.get('/topics/:id', getTopic);
adminRouter.patch('/topics/:id', updateTopic);
adminRouter.delete('/topics/:id', deleteTopic);

adminRouter.post('/topics/:topicId/chapters', createChapter);
adminRouter.patch('/chapters/:id', updateChapter);
adminRouter.delete('/chapters/:id', deleteChapter);

adminRouter.post('/chapters/:chapterId/lessons', createLesson);
adminRouter.patch('/lessons/:id', updateLesson);
adminRouter.delete('/lessons/:id', deleteLesson);

adminRouter.post('/lessons/:lessonId/activities', createActivity);
adminRouter.patch('/activities/:id', updateActivity);
adminRouter.delete('/activities/:id', deleteActivity);

adminRouter.post('/chapters/:chapterId/assessments', createAssessment);
adminRouter.patch('/assessments/:id', updateAssessment);
adminRouter.delete('/assessments/:id', deleteAssessment);

adminRouter.post('/challenges', createChallenge);
adminRouter.get('/challenges', listChallengesAdmin);
adminRouter.patch('/challenges/:id', updateChallenge);
adminRouter.delete('/challenges/:id', deleteChallenge);
