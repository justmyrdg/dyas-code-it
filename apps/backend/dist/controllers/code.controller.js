"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLanguages = listLanguages;
exports.executeCode = executeCode;
const code_execution_service_1 = require("../services/code-execution.service");
const http_1 = require("../utils/http");
async function listLanguages(req, res, next) {
    try {
        const languages = await code_execution_service_1.codeExecutor.listLanguages();
        res.json({ languages });
    }
    catch (err) {
        if (err instanceof code_execution_service_1.ExecutionError) {
            (0, http_1.sendError)(res, err.status, err.code, err.message);
            return;
        }
        next(err);
    }
}
async function executeCode(req, res, next) {
    try {
        const { language, source, stdin } = req.body;
        if (typeof language !== 'string' || !language.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'A language is required.');
            return;
        }
        if (typeof source !== 'string' || !source.trim()) {
            (0, http_1.sendError)(res, 400, 'missing_fields', 'Source code is required.');
            return;
        }
        if (stdin !== undefined && typeof stdin !== 'string') {
            (0, http_1.sendError)(res, 400, 'invalid_stdin', 'stdin must be a string.');
            return;
        }
        const result = await code_execution_service_1.codeExecutor.execute({ language, source, stdin });
        res.json({ result });
    }
    catch (err) {
        if (err instanceof code_execution_service_1.ExecutionError) {
            (0, http_1.sendError)(res, err.status, err.code, err.message);
            return;
        }
        next(err);
    }
}
//# sourceMappingURL=code.controller.js.map