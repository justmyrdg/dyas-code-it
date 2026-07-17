import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { CODE_EXECUTION_RATE_PER_MIN } from '../config/limits';
import { executeCode, listLanguages } from '../controllers/code.controller';

export const codeRouter = Router();

codeRouter.use(requireAuth);

// Executing code hits a paid/rate-limited hosted sandbox, so cap runs per authenticated user.
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: CODE_EXECUTION_RATE_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'anonymous',
  handler: (req, res) => {
    res.status(429).json({
      error: { code: 'rate_limited', message: 'Too many runs. Please wait a moment and try again.' },
    });
  },
});

codeRouter.get('/languages', listLanguages);
codeRouter.post('/execute', executeLimiter, executeCode);
