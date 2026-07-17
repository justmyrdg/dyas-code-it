"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = sendError;
function sendError(res, status, code, message) {
    res.status(status).json({ error: { code, message } });
}
//# sourceMappingURL=http.js.map