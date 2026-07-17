"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const student_controller_1 = require("../controllers/student.controller");
const assessment_controller_1 = require("../controllers/assessment.controller");
const project_controller_1 = require("../controllers/project.controller");
const challenge_controller_1 = require("../controllers/challenge.controller");
const certificate_controller_1 = require("../controllers/certificate.controller");
const dyas_controller_1 = require("../controllers/dyas.controller");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const limits_1 = require("../config/limits");
exports.studentRouter = (0, express_1.Router)();
exports.studentRouter.use(auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)('student'));
exports.studentRouter.post('/enrollments', student_controller_1.joinClass);
exports.studentRouter.get('/classes', student_controller_1.listMyClasses);
exports.studentRouter.get('/classes/:classId', student_controller_1.getClassCurriculum);
exports.studentRouter.get('/classes/:classId/lessons/:lessonId', student_controller_1.getLesson);
exports.studentRouter.post('/classes/:classId/lessons/:lessonId/complete', student_controller_1.completeLesson);
exports.studentRouter.post('/classes/:classId/activities/:activityId/submit', student_controller_1.submitActivity);
exports.studentRouter.get('/classes/:classId/assessments/:assessmentId', assessment_controller_1.getAssessmentForStudent);
exports.studentRouter.post('/classes/:classId/assessments/:assessmentId/submit', assessment_controller_1.submitAssessment);
// Practice sandbox
exports.studentRouter.get('/projects', project_controller_1.listMyProjects);
exports.studentRouter.post('/projects', project_controller_1.createProject);
exports.studentRouter.get('/projects/:projectId', project_controller_1.getMyProject);
exports.studentRouter.patch('/projects/:projectId', project_controller_1.updateMyProject);
exports.studentRouter.delete('/projects/:projectId', project_controller_1.deleteMyProject);
exports.studentRouter.post('/projects/:projectId/versions', project_controller_1.saveVersion);
exports.studentRouter.post('/projects/:projectId/versions/:versionId/restore', project_controller_1.restoreVersion);
// Guided challenges
exports.studentRouter.get('/challenges', challenge_controller_1.listChallengesForStudent);
exports.studentRouter.post('/challenges/:id/start', challenge_controller_1.startChallenge);
exports.studentRouter.post('/challenges/:id/hint', challenge_controller_1.requestHint);
exports.studentRouter.post('/challenges/:id/complete', challenge_controller_1.completeChallenge);
// Certificates
exports.studentRouter.get('/classes/:classId/certificate-eligibility', certificate_controller_1.getCertificateEligibility);
exports.studentRouter.post('/classes/:classId/certificate', certificate_controller_1.claimCertificate);
exports.studentRouter.get('/certificates', certificate_controller_1.listMyCertificates);
exports.studentRouter.get('/certificates/:id', certificate_controller_1.getMyCertificate);
// Dyas AI assistant — each message is a paid Claude call, so rate-limit per user.
const dyasLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: limits_1.DYAS_RATE_PER_MIN,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'anonymous',
    handler: (req, res) => {
        res.status(429).json({
            error: { code: 'rate_limited', message: 'Dyas needs a short break. Try again in a minute.' },
        });
    },
});
exports.studentRouter.post('/dyas/chat', dyasLimiter, dyas_controller_1.chat);
exports.studentRouter.get('/dyas/conversations', dyas_controller_1.listConversations);
exports.studentRouter.get('/dyas/conversations/:id', dyas_controller_1.getConversation);
//# sourceMappingURL=student.routes.js.map