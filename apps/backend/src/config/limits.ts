// Hardcoded free-tier limits for Phase 1 — replaced by real subscription data when Stripe lands.
export const FREE_TIER_CLASS_LIMIT = 2;
export const MAX_STUDENTS_PER_CLASS = 50;

// Code execution (Phase A1). The executor calls a hosted sandbox (Piston) — no Docker here.
export const CODE_EXECUTION_TIMEOUT_MS = 5000;
export const CODE_EXECUTION_MAX_SOURCE_BYTES = 64 * 1024; // 64 KB of source per run
export const CODE_EXECUTION_RATE_PER_MIN = 30; // per authenticated user

// Password reset request throttling.
export const PASSWORD_RESET_RATE_PER_HOUR = 5;

// Dyas AI chat — each message is a paid Claude API call, so cap per user.
export const DYAS_RATE_PER_MIN = 20;
