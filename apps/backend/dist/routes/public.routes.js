"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const certificate_controller_1 = require("../controllers/certificate.controller");
const project_controller_1 = require("../controllers/project.controller");
// Unauthenticated endpoints: certificate verification (QR scan target) and
// public portfolio projects (share links).
exports.publicRouter = (0, express_1.Router)();
exports.publicRouter.get('/certificates/verify/:code', certificate_controller_1.verifyCertificate);
exports.publicRouter.get('/projects/:projectId', project_controller_1.getPublicProject);
//# sourceMappingURL=public.routes.js.map