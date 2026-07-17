"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const passport_1 = __importDefault(require("../config/passport"));
const auth_service_1 = require("../services/auth.service");
const limits_1 = require("../config/limits");
const APP_URL = process.env.APP_URL || 'http://localhost:4201';
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', auth_controller_1.register);
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.post('/logout', auth_controller_1.logout);
exports.authRouter.get('/me', auth_middleware_1.requireAuth, auth_controller_1.me);
const forgotPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: limits_1.PASSWORD_RESET_RATE_PER_HOUR,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? 'anonymous',
    handler: (req, res) => {
        res.status(429).json({
            error: { code: 'rate_limited', message: 'Too many requests. Please try again later.' },
        });
    },
});
exports.authRouter.post('/forgot-password', forgotPasswordLimiter, auth_controller_1.forgotPassword);
exports.authRouter.post('/reset-password', auth_controller_1.resetPassword);
exports.authRouter.get('/github', (req, res, next) => {
    const role = req.query.role === 'teacher' ? 'teacher' : 'student';
    passport_1.default.authenticate('github', { session: false, scope: ['user:email'], state: role })(req, res, next);
});
exports.authRouter.get('/github/callback', (req, res, next) => {
    passport_1.default.authenticate('github', { session: false }, (err, user) => {
        try {
            if (err || !user) {
                res.redirect(`${APP_URL}/login?error=oauth_failed`);
                return;
            }
            (0, auth_service_1.setAuthCookie)(res, (0, auth_service_1.signAuthToken)(user));
            res.redirect(`${APP_URL}/dashboard`);
        }
        catch (signErr) {
            next(signErr);
        }
    })(req, res, next);
});
exports.authRouter.get('/google', (req, res, next) => {
    const role = req.query.role === 'teacher' ? 'teacher' : 'student';
    passport_1.default.authenticate('google', { session: false, scope: ['profile', 'email'], state: role })(req, res, next);
});
exports.authRouter.get('/google/callback', (req, res, next) => {
    passport_1.default.authenticate('google', { session: false }, (err, user) => {
        try {
            if (err || !user) {
                res.redirect(`${APP_URL}/login?error=oauth_failed`);
                return;
            }
            (0, auth_service_1.setAuthCookie)(res, (0, auth_service_1.signAuthToken)(user));
            res.redirect(`${APP_URL}/dashboard`);
        }
        catch (signErr) {
            next(signErr);
        }
    })(req, res, next);
});
//# sourceMappingURL=auth.routes.js.map