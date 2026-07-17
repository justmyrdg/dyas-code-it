import { Router } from 'express';
import { verifyCertificate } from '../controllers/certificate.controller';
import { getPublicProject } from '../controllers/project.controller';

// Unauthenticated endpoints: certificate verification (QR scan target) and
// public portfolio projects (share links).
export const publicRouter = Router();

publicRouter.get('/certificates/verify/:code', verifyCertificate);
publicRouter.get('/projects/:projectId', getPublicProject);
