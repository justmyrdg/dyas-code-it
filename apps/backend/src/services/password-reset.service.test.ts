import { describe, it, expect } from 'vitest';
import { generateResetToken, hashResetToken, isResetTokenValid } from './password-reset.service';

describe('generateResetToken', () => {
  it('produces a raw token whose hash matches the returned tokenHash', () => {
    const { rawToken, tokenHash } = generateResetToken();
    expect(hashResetToken(rawToken)).toBe(tokenHash);
  });

  it('does not return the raw token as the hash', () => {
    const { rawToken, tokenHash } = generateResetToken();
    expect(tokenHash).not.toBe(rawToken);
  });

  it('sets expiresAt to 1 hour after the given time', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const { expiresAt } = generateResetToken(now);
    expect(expiresAt.getTime()).toBe(now.getTime() + 60 * 60 * 1000);
  });

  it('generates different tokens on each call', () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a.rawToken).not.toBe(b.rawToken);
  });
});

describe('hashResetToken', () => {
  it('is deterministic for the same input', () => {
    expect(hashResetToken('abc')).toBe(hashResetToken('abc'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashResetToken('abc')).not.toBe(hashResetToken('xyz'));
  });
});

describe('isResetTokenValid', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');

  it('is true when expiresAt is in the future', () => {
    const future = new Date(now.getTime() + 1000);
    expect(isResetTokenValid(future, now)).toBe(true);
  });

  it('is false when expiresAt is in the past', () => {
    const past = new Date(now.getTime() - 1000);
    expect(isResetTokenValid(past, now)).toBe(false);
  });

  it('is false when expiresAt is null', () => {
    expect(isResetTokenValid(null, now)).toBe(false);
  });
});
