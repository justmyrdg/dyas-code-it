import type { NextFunction, Request, Response } from 'express';
import { User } from '../models/User';
import type { AuthUser, UserRole } from '../types/auth.types';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  setAuthCookie,
  clearAuthCookie,
} from '../services/auth.service';
import { generateResetToken, hashResetToken, isResetTokenValid } from '../services/password-reset.service';
import { sendPasswordResetEmail, sendOAuthOnlyNotice } from '../services/email.service';

const APP_URL = process.env.APP_URL || 'http://localhost:4201';

function sendError(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ error: { code, message } });
}

function clampRole(role: unknown): Exclude<UserRole, 'admin'> {
  return role === 'teacher' ? 'teacher' : 'student';
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    if (!name || !email || !password) {
      sendError(res, 400, 'missing_fields', 'Please fill in all fields.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      sendError(res, 409, 'email_taken', 'An account with that email already exists.');
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name,
      role: clampRole(role),
      githubId: null,
      googleId: null,
      avatarUrl: null,
    });

    setAuthCookie(res, signAuthToken(user));
    res.status(200).json({ user: toAuthUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      sendError(res, 400, 'missing_fields', 'Please fill in all fields.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      sendError(res, 401, 'invalid_credentials', 'Incorrect email or password.');
      return;
    }

    if (!user.passwordHash) {
      sendError(
        res,
        401,
        'oauth_only',
        'That account was created with Google or GitHub. Use the matching button below.',
      );
      return;
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      sendError(res, 401, 'invalid_credentials', 'Incorrect email or password.');
      return;
    }

    setAuthCookie(res, signAuthToken(user));
    res.status(200).json({ user: toAuthUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    clearAuthCookie(res);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findByPk(req.user!.sub);
    if (!user) {
      res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
      return;
    }
    res.json({ user: toAuthUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      sendError(res, 400, 'missing_fields', 'Please enter your email.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (user?.passwordHash) {
      const { rawToken, tokenHash, expiresAt } = generateResetToken();
      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = expiresAt;
      await user.save();
      const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    } else if (user && !user.passwordHash) {
      await sendOAuthOnlyNotice(user.email);
    }

    // Same response whether or not the email exists, is OAuth-only, or sending
    // failed — avoids leaking which emails are registered.
    res.status(200).json({ message: "If that email exists, we've sent instructions." });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword || newPassword.length < 8) {
      sendError(
        res,
        400,
        'invalid_or_expired_token',
        'Please provide a valid token and a password of at least 8 characters.',
      );
      return;
    }

    const tokenHash = hashResetToken(token);
    const user = await User.findOne({ where: { passwordResetTokenHash: tokenHash } });

    if (!user || !isResetTokenValid(user.passwordResetExpiresAt)) {
      sendError(res, 400, 'invalid_or_expired_token', 'This reset link is invalid or has expired.');
      return;
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export { toAuthUser };
