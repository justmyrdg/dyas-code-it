"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const auth_service_1 = require("../services/auth.service");
function requireAuth(req, res, next) {
    const token = req.cookies?.[auth_service_1.AUTH_COOKIE_NAME];
    if (!token) {
        res.status(401).json({ error: { message: 'Not authenticated', status: 401 } });
        return;
    }
    try {
        req.user = (0, auth_service_1.verifyAuthToken)(token);
        next();
    }
    catch {
        res.status(401).json({ error: { message: 'Invalid or expired session', status: 401 } });
    }
}
//# sourceMappingURL=auth.middleware.js.map