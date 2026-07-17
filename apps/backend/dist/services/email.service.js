"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendOAuthOnlyNotice = sendOAuthOnlyNotice;
const nodemailer_1 = __importDefault(require("nodemailer"));
// SMTP credentials are left unset in .env.example — fill them in before this
// service can actually deliver mail (see docs/superpowers/specs/2026-07-17-password-reset-design.md).
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
});
const FROM = process.env.SMTP_FROM || 'no-reply@dyascodeit.com';
async function sendPasswordResetEmail(to, resetUrl) {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Reset your DyasCodeIT password',
        text: `We received a request to reset your password. This link expires in 1 hour:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>We received a request to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
}
async function sendOAuthOnlyNotice(to) {
    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'About your DyasCodeIT sign-in',
        text: 'You requested a password reset, but this account was created using GitHub or Google sign-in and has no password. Please use the "Continue with GitHub" or "Continue with Google" button on the login page instead.',
        html: '<p>You requested a password reset, but this account was created using GitHub or Google sign-in and has no password.</p><p>Please use the "Continue with GitHub" or "Continue with Google" button on the login page instead.</p>',
    });
}
//# sourceMappingURL=email.service.js.map