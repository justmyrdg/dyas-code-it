"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const limits_1 = require("../config/limits");
const code_controller_1 = require("../controllers/code.controller");
exports.codeRouter = (0, express_1.Router)();
exports.codeRouter.use(auth_middleware_1.requireAuth);
// Executing code hits a paid/rate-limited hosted sandbox, so cap runs per authenticated user.
const executeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: limits_1.CODE_EXECUTION_RATE_PER_MIN,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'anonymous',
    handler: (req, res) => {
        res.status(429).json({
            error: { code: 'rate_limited', message: 'Too many runs. Please wait a moment and try again.' },
        });
    },
});
exports.codeRouter.get('/languages', code_controller_1.listLanguages);
exports.codeRouter.post('/execute', executeLimiter, code_controller_1.executeCode);
//# sourceMappingURL=code.routes.js.map