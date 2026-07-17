"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("./config/env");
const passport_1 = __importDefault(require("./config/passport"));
const auth_routes_1 = require("./routes/auth.routes");
const admin_routes_1 = require("./routes/admin.routes");
const teacher_routes_1 = require("./routes/teacher.routes");
const student_routes_1 = require("./routes/student.routes");
const code_routes_1 = require("./routes/code.routes");
const public_routes_1 = require("./routes/public.routes");
const subscription_controller_1 = require("./controllers/subscription.controller");
const app = (0, express_1.default)();
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    process.env.APP_URL || 'http://localhost:4201',
];
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// Stripe webhook must see the raw request bytes for signature verification, so
// it is mounted BEFORE the JSON body parser.
app.post('/api/stripe/webhook', express_1.default.raw({ type: 'application/json' }), subscription_controller_1.stripeWebhook);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/admin', admin_routes_1.adminRouter);
app.use('/api/teacher', teacher_routes_1.teacherRouter);
app.use('/api/student', student_routes_1.studentRouter);
app.use('/api/code', code_routes_1.codeRouter);
app.use('/api/public', public_routes_1.publicRouter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
        },
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map