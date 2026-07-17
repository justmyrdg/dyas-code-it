"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeExecutor = exports.SUPPORTED_LANGUAGES = exports.ExecutionError = void 0;
const axios_1 = __importDefault(require("axios"));
const limits_1 = require("../config/limits");
// Thrown for caller-facing failures (bad language, executor down). Carries an HTTP-ish
// status + machine code so the controller can forward it via sendError().
class ExecutionError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ExecutionError';
    }
}
exports.ExecutionError = ExecutionError;
// Internal language id -> how Piston refers to it + the filename it expects. Keep these
// ids in sync with the frontend highlighter (core/code-block.ts): python/cpp/javascript/java.
const LANGUAGE_MAP = {
    python: { piston: 'python', filename: 'main.py', label: 'Python' },
    javascript: { piston: 'javascript', filename: 'main.js', label: 'JavaScript' },
    cpp: { piston: 'c++', filename: 'main.cpp', label: 'C++' },
    java: { piston: 'java', filename: 'Main.java', label: 'Java' },
};
exports.SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP);
// Compares dotted version strings numerically (e.g. "3.10.0" > "3.9.4"). Returns >0 / 0 / <0.
function compareVersions(a, b) {
    const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
    const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (diff !== 0)
            return diff;
    }
    return 0;
}
class PistonExecutor {
    constructor() {
        this.baseUrl = process.env.PISTON_URL?.replace(/\/$/, '') || 'https://emkc.org/api/v2/piston';
        // Piston's /execute requires an exact runtime version. Rather than hardcode versions
        // that drift on the public instance, resolve the highest available version per language
        // once and cache it for the process lifetime.
        this.runtimeCache = null;
    }
    async resolveVersions() {
        if (this.runtimeCache)
            return this.runtimeCache;
        let runtimes;
        try {
            const { data } = await axios_1.default.get(`${this.baseUrl}/runtimes`, {
                timeout: 10000,
            });
            runtimes = data;
        }
        catch {
            throw new ExecutionError(502, 'executor_unavailable', 'Code execution service is unavailable.');
        }
        const map = new Map();
        for (const rt of runtimes) {
            for (const key of [rt.language, ...(rt.aliases ?? [])]) {
                const existing = map.get(key);
                if (!existing || compareVersions(rt.version, existing) > 0) {
                    map.set(key, rt.version);
                }
            }
        }
        this.runtimeCache = map;
        return map;
    }
    async listLanguages() {
        const versions = await this.resolveVersions();
        return exports.SUPPORTED_LANGUAGES.filter((id) => versions.has(LANGUAGE_MAP[id].piston)).map((id) => ({
            id,
            label: LANGUAGE_MAP[id].label,
        }));
    }
    async execute({ language, source, stdin }) {
        const lang = LANGUAGE_MAP[language];
        if (!lang) {
            throw new ExecutionError(400, 'unsupported_language', `Language '${language}' is not supported.`);
        }
        if (Buffer.byteLength(source, 'utf8') > limits_1.CODE_EXECUTION_MAX_SOURCE_BYTES) {
            throw new ExecutionError(413, 'source_too_large', 'Source code exceeds the size limit.');
        }
        const versions = await this.resolveVersions();
        const version = versions.get(lang.piston);
        if (!version) {
            throw new ExecutionError(502, 'language_unavailable', `Runtime for '${language}' is unavailable.`);
        }
        let data;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/execute`, {
                language: lang.piston,
                version,
                files: [{ name: lang.filename, content: source }],
                stdin: stdin ?? '',
                run_timeout: limits_1.CODE_EXECUTION_TIMEOUT_MS,
                compile_timeout: 10000,
            }, { timeout: limits_1.CODE_EXECUTION_TIMEOUT_MS + 15000 });
            data = response.data;
        }
        catch {
            throw new ExecutionError(502, 'executor_unavailable', 'Code execution service is unavailable.');
        }
        const compile = data.compile;
        const run = data.run;
        // A failed compile step means the program never ran — surface the compiler diagnostics.
        if (compile && compile.code !== 0 && (compile.stderr || compile.output)) {
            return {
                stdout: run?.stdout ?? '',
                stderr: compile.stderr || compile.output || '',
                exitCode: compile.code,
                timedOut: false,
            };
        }
        // Piston kills a run that exceeds run_timeout with SIGKILL.
        const timedOut = (run?.signal ?? null) === 'SIGKILL';
        return {
            stdout: run?.stdout ?? '',
            stderr: run?.stderr ?? '',
            exitCode: run?.code ?? null,
            timedOut,
        };
    }
}
// Shared singleton — reused by the code controller and (Phase A2) the grading service.
exports.codeExecutor = new PistonExecutor();
//# sourceMappingURL=code-execution.service.js.map