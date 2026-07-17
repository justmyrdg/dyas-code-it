"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_RESET_EXPIRY_MS = void 0;
exports.hashResetToken = hashResetToken;
exports.generateResetToken = generateResetToken;
exports.isResetTokenValid = isResetTokenValid;
const crypto_1 = __importDefault(require("crypto"));
// 1 hour — matches the design spec (docs/superpowers/specs/2026-07-17-password-reset-design.md).
exports.PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_BYTES = 32;
function hashResetToken(rawToken) {
    return crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
}
function generateResetToken(now = new Date()) {
    const rawToken = crypto_1.default.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');
    return {
        rawToken,
        tokenHash: hashResetToken(rawToken),
        expiresAt: new Date(now.getTime() + exports.PASSWORD_RESET_EXPIRY_MS),
    };
}
function isResetTokenValid(expiresAt, now = new Date()) {
    return expiresAt !== null && expiresAt.getTime() > now.getTime();
}
//# sourceMappingURL=password-reset.service.js.map