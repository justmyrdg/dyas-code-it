"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
// Assumes requireAuth already ran and populated req.user.
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: { message: 'Forbidden', status: 403 } });
            return;
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map