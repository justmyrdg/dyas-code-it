import crypto from 'crypto';

// 1 hour — matches the design spec (docs/superpowers/specs/2026-07-17-password-reset-design.md).
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_BYTES = 32;

export interface GeneratedResetToken {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

export function hashResetToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateResetToken(now: Date = new Date()): GeneratedResetToken {
  const rawToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
  return {
    rawToken,
    tokenHash: hashResetToken(rawToken),
    expiresAt: new Date(now.getTime() + PASSWORD_RESET_EXPIRY_MS),
  };
}

export function isResetTokenValid(expiresAt: Date | null, now: Date = new Date()): boolean {
  return expiresAt !== null && expiresAt.getTime() > now.getTime();
}
