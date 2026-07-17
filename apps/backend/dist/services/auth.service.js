"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_COOKIE_NAME = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
exports.setAuthCookie = setAuthCookie;
exports.clearAuthCookie = clearAuthCookie;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // keep in sync with JWT_EXPIRY default above
exports.AUTH_COOKIE_NAME = 'dyas_token';
function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function signAuthToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
function verifyAuthToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function setAuthCookie(res, token) {
    res.cookie(exports.AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE_MS,
    });
}
function clearAuthCookie(res) {
    res.clearCookie(exports.AUTH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
}
//# sourceMappingURL=auth.service.js.map