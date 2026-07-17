"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DYAS_RATE_PER_MIN = exports.PASSWORD_RESET_RATE_PER_HOUR = exports.CODE_EXECUTION_RATE_PER_MIN = exports.CODE_EXECUTION_MAX_SOURCE_BYTES = exports.CODE_EXECUTION_TIMEOUT_MS = exports.MAX_STUDENTS_PER_CLASS = exports.FREE_TIER_CLASS_LIMIT = void 0;
// Hardcoded free-tier limits for Phase 1 — replaced by real subscription data when Stripe lands.
exports.FREE_TIER_CLASS_LIMIT = 2;
exports.MAX_STUDENTS_PER_CLASS = 50;
// Code execution (Phase A1). The executor calls a hosted sandbox (Piston) — no Docker here.
exports.CODE_EXECUTION_TIMEOUT_MS = 5000;
exports.CODE_EXECUTION_MAX_SOURCE_BYTES = 64 * 1024; // 64 KB of source per run
exports.CODE_EXECUTION_RATE_PER_MIN = 30; // per authenticated user
// Password reset request throttling.
exports.PASSWORD_RESET_RATE_PER_HOUR = 5;
// Dyas AI chat — each message is a paid Claude API call, so cap per user.
exports.DYAS_RATE_PER_MIN = 20;
//# sourceMappingURL=limits.js.map