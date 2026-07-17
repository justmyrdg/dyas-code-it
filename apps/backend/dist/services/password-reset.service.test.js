"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const password_reset_service_1 = require("./password-reset.service");
(0, vitest_1.describe)('generateResetToken', () => {
    (0, vitest_1.it)('produces a raw token whose hash matches the returned tokenHash', () => {
        const { rawToken, tokenHash } = (0, password_reset_service_1.generateResetToken)();
        (0, vitest_1.expect)((0, password_reset_service_1.hashResetToken)(rawToken)).toBe(tokenHash);
    });
    (0, vitest_1.it)('does not return the raw token as the hash', () => {
        const { rawToken, tokenHash } = (0, password_reset_service_1.generateResetToken)();
        (0, vitest_1.expect)(tokenHash).not.toBe(rawToken);
    });
    (0, vitest_1.it)('sets expiresAt to 1 hour after the given time', () => {
        const now = new Date('2026-01-01T00:00:00.000Z');
        const { expiresAt } = (0, password_reset_service_1.generateResetToken)(now);
        (0, vitest_1.expect)(expiresAt.getTime()).toBe(now.getTime() + 60 * 60 * 1000);
    });
    (0, vitest_1.it)('generates different tokens on each call', () => {
        const a = (0, password_reset_service_1.generateResetToken)();
        const b = (0, password_reset_service_1.generateResetToken)();
        (0, vitest_1.expect)(a.rawToken).not.toBe(b.rawToken);
    });
});
(0, vitest_1.describe)('hashResetToken', () => {
    (0, vitest_1.it)('is deterministic for the same input', () => {
        (0, vitest_1.expect)((0, password_reset_service_1.hashResetToken)('abc')).toBe((0, password_reset_service_1.hashResetToken)('abc'));
    });
    (0, vitest_1.it)('produces different hashes for different inputs', () => {
        (0, vitest_1.expect)((0, password_reset_service_1.hashResetToken)('abc')).not.toBe((0, password_reset_service_1.hashResetToken)('xyz'));
    });
});
(0, vitest_1.describe)('isResetTokenValid', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    (0, vitest_1.it)('is true when expiresAt is in the future', () => {
        const future = new Date(now.getTime() + 1000);
        (0, vitest_1.expect)((0, password_reset_service_1.isResetTokenValid)(future, now)).toBe(true);
    });
    (0, vitest_1.it)('is false when expiresAt is in the past', () => {
        const past = new Date(now.getTime() - 1000);
        (0, vitest_1.expect)((0, password_reset_service_1.isResetTokenValid)(past, now)).toBe(false);
    });
    (0, vitest_1.it)('is false when expiresAt is null', () => {
        (0, vitest_1.expect)((0, password_reset_service_1.isResetTokenValid)(null, now)).toBe(false);
    });
});
//# sourceMappingURL=password-reset.service.test.js.map