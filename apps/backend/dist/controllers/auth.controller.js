"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.me = me;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.toAuthUser = toAuthUser;
const User_1 = require("../models/User");
const auth_service_1 = require("../services/auth.service");
const password_reset_service_1 = require("../services/password-reset.service");
const email_service_1 = require("../services/email.service");
const APP_URL = process.env.APP_URL || 'http://localhost:4201';
function sendError(res, status, code, message) {
    res.status(status).json({ error: { code, message } });
}
function clampRole(role) {
    return role === 'teacher' ? 'teacher' : 'student';
}
function toAuthUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
    };
}
async function register(req, res, next) {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            sendError(res, 400, 'missing_fields', 'Please fill in all fields.');
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User_1.User.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            sendError(res, 409, 'email_taken', 'An account with that email already exists.');
            return;
        }
        const passwordHash = await (0, auth_service_1.hashPassword)(password);
        const user = await User_1.User.create({
            email: normalizedEmail,
            passwordHash,
            name,
            role: clampRole(role),
            githubId: null,
            googleId: null,
            avatarUrl: null,
        });
        (0, auth_service_1.setAuthCookie)(res, (0, auth_service_1.signAuthToken)(user));
        res.status(200).json({ user: toAuthUser(user) });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            sendError(res, 400, 'missing_fields', 'Please fill in all fields.');
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.User.findOne({ where: { email: normalizedEmail } });
        if (!user) {
            sendError(res, 401, 'invalid_credentials', 'Incorrect email or password.');
            return;
        }
        if (!user.passwordHash) {
            sendError(res, 401, 'oauth_only', 'That account was created with Google or GitHub. Use the matching button below.');
            return;
        }
        const valid = await (0, auth_service_1.verifyPassword)(password, user.passwordHash);
        if (!valid) {
            sendError(res, 401, 'invalid_credentials', 'Incorrect email or password.');
            return;
        }
        (0, auth_service_1.setAuthCookie)(res, (0, auth_service_1.signAuthToken)(user));
        res.status(200).json({ user: toAuthUser(user) });
    }
    catch (err) {
        next(err);
    }
}
async function logout(_req, res, next) {
    try {
        (0, auth_service_1.clearAuthCookie)(res);
        res.status(200).json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
async function me(req, res, next) {
    try {
        const user = await User_1.User.findByPk(req.user.sub);
        if (!user) {
            res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
            return;
        }
        res.json({ user: toAuthUser(user) });
    }
    catch (err) {
        next(err);
    }
}
async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) {
            sendError(res, 400, 'missing_fields', 'Please enter your email.');
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.User.findOne({ where: { email: normalizedEmail } });
        if (user?.passwordHash) {
            const { rawToken, tokenHash, expiresAt } = (0, password_reset_service_1.generateResetToken)();
            user.passwordResetTokenHash = tokenHash;
            user.passwordResetExpiresAt = expiresAt;
            await user.save();
            const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
            await (0, email_service_1.sendPasswordResetEmail)(user.email, resetUrl);
        }
        else if (user && !user.passwordHash) {
            await (0, email_service_1.sendOAuthOnlyNotice)(user.email);
        }
        // Same response whether or not the email exists, is OAuth-only, or sending
        // failed — avoids leaking which emails are registered.
        res.status(200).json({ message: "If that email exists, we've sent instructions." });
    }
    catch (err) {
        next(err);
    }
}
async function resetPassword(req, res, next) {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 8) {
            sendError(res, 400, 'invalid_or_expired_token', 'Please provide a valid token and a password of at least 8 characters.');
            return;
        }
        const tokenHash = (0, password_reset_service_1.hashResetToken)(token);
        const user = await User_1.User.findOne({ where: { passwordResetTokenHash: tokenHash } });
        if (!user || !(0, password_reset_service_1.isResetTokenValid)(user.passwordResetExpiresAt)) {
            sendError(res, 400, 'invalid_or_expired_token', 'This reset link is invalid or has expired.');
            return;
        }
        user.passwordHash = await (0, auth_service_1.hashPassword)(newPassword);
        user.passwordResetTokenHash = null;
        user.passwordResetExpiresAt = null;
        await user.save();
        res.status(200).json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=auth.controller.js.map