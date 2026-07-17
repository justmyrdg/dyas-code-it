import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import passport from '../config/passport';
import { User } from '../models/User';
import { signAuthToken, setAuthCookie } from '../services/auth.service';
import { PASSWORD_RESET_RATE_PER_HOUR } from '../config/limits';

const APP_URL = process.env.APP_URL || 'http://localhost:4201';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: PASSWORD_RESET_RATE_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? 'anonymous',
  handler: (req, res) => {
    res.status(429).json({
      error: { code: 'rate_limited', message: 'Too many requests. Please try again later.' },
    });
  },
});

authRouter.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
authRouter.post('/reset-password', resetPassword);

authRouter.get('/github', (req, res, next) => {
  const role = req.query.role === 'teacher' ? 'teacher' : 'student';
  passport.authenticate('github', { session: false, scope: ['user:email'], state: role })(req, res, next);
});

authRouter.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err: unknown, user: User | false) => {
    try {
      if (err || !user) {
        res.redirect(`${APP_URL}/login?error=oauth_failed`);
        return;
      }
      setAuthCookie(res, signAuthToken(user));
      res.redirect(`${APP_URL}/dashboard`);
    } catch (signErr) {
      next(signErr);
    }
  })(req, res, next);
});

authRouter.get('/google', (req, res, next) => {
  const role = req.query.role === 'teacher' ? 'teacher' : 'student';
  passport.authenticate('google', { session: false, scope: ['profile', 'email'], state: role })(req, res, next);
});

authRouter.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: unknown, user: User | false) => {
    try {
      if (err || !user) {
        res.redirect(`${APP_URL}/login?error=oauth_failed`);
        return;
      }
      setAuthCookie(res, signAuthToken(user));
      res.redirect(`${APP_URL}/dashboard`);
    } catch (signErr) {
      next(signErr);
    }
  })(req, res, next);
});
