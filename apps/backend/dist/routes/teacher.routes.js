"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const class_controller_1 = require("../controllers/class.controller");
const assessment_controller_1 = require("../controllers/assessment.controller");
const project_controller_1 = require("../controllers/project.controller");
const subscription_controller_1 = require("../controllers/subscription.controller");
const integrity_controller_1 = require("../controllers/integrity.controller");
exports.teacherRouter = (0, express_1.Router)();
exports.teacherRouter.use(auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)('teacher'));
exports.teacherRouter.get('/topics', class_controller_1.listPublishedTopics);
exports.teacherRouter.post('/classes', class_controller_1.createClass);
exports.teacherRouter.get('/classes', class_controller_1.listClasses);
exports.teacherRouter.get('/classes/:id', class_controller_1.getClass);
exports.teacherRouter.get('/classes/:id/progress', class_controller_1.getClassProgress);
exports.teacherRouter.patch('/classes/:id', class_controller_1.updateClass);
exports.teacherRouter.get('/classes/:classId/grading-queue', assessment_controller_1.listPendingSubmissions);
exports.teacherRouter.get('/classes/:classId/integrity', integrity_controller_1.getClassIntegrityReport);
exports.teacherRouter.get('/submissions/:submissionId', assessment_controller_1.getSubmissionForTeacher);
exports.teacherRouter.patch('/submissions/:submissionId/grade', assessment_controller_1.gradeSubmission);
// Subscription / premium upgrade
exports.teacherRouter.get('/subscription', subscription_controller_1.getSubscription);
exports.teacherRouter.post('/subscription/checkout', subscription_controller_1.startCheckout);
// Practice projects shared by students in this teacher's classes
exports.teacherRouter.get('/projects', project_controller_1.listSharedProjects);
exports.teacherRouter.get('/projects/:projectId', project_controller_1.getSharedProject);
exports.teacherRouter.patch('/projects/:projectId/versions/:versionId/feedback', project_controller_1.leaveVersionFeedback);
//# sourceMappingURL=teacher.routes.js.map