"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRealtime = initRealtime;
exports.getIo = getIo;
exports.emitToUser = emitToUser;
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../services/auth.service");
let io = null;
function parseCookie(header, name) {
    if (!header)
        return undefined;
    for (const part of header.split(';')) {
        const eq = part.indexOf('=');
        if (eq === -1)
            continue;
        if (part.slice(0, eq).trim() === name) {
            return decodeURIComponent(part.slice(eq + 1).trim());
        }
    }
    return undefined;
}
function authenticate(socket, next) {
    try {
        const token = parseCookie(socket.handshake.headers.cookie, auth_service_1.AUTH_COOKIE_NAME) ??
            // Also accept a handshake auth token, for non-cookie clients and tests.
            socket.handshake.auth?.token;
        if (!token) {
            next(new Error('Not authenticated'));
            return;
        }
        socket.data.user = (0, auth_service_1.verifyAuthToken)(token);
        next();
    }
    catch {
        next(new Error('Invalid or expired session'));
    }
}
// Attaches Socket.io to the HTTP server. Two namespaces:
//   /dyas     — streaming AI assistant replies (Phase 2)
//   /projects — live teacher feedback on shared practice projects (Phase 3)
// Both authenticate every connection and drop each user into a private
// `user:<id>` room so services can target a specific user's sockets.
function initRealtime(httpServer) {
    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:4200',
        process.env.APP_URL || 'http://localhost:4201',
    ];
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: allowedOrigins, credentials: true },
    });
    const dyas = io.of('/dyas');
    dyas.use(authenticate);
    dyas.on('connection', (socket) => {
        socket.join(`user:${socket.data.user.sub}`);
    });
    const projects = io.of('/projects');
    projects.use(authenticate);
    projects.on('connection', (socket) => {
        socket.join(`user:${socket.data.user.sub}`);
        // Clients subscribe to a project room to receive its live feedback.
        // NOTE (Phase 3): verify the user may view the project before joining once
        // PracticeProject visibility rules exist — no project events are emitted yet.
        socket.on('project:subscribe', (projectId) => {
            socket.join(`project:${projectId}`);
        });
        socket.on('project:unsubscribe', (projectId) => {
            socket.leave(`project:${projectId}`);
        });
    });
    return io;
}
function getIo() {
    if (!io) {
        throw new Error('Realtime not initialized. Call initRealtime() before getIo().');
    }
    return io;
}
// Fire-and-forget emit to one user's sockets on a namespace. Safe to call from
// HTTP controllers: realtime being down must never fail the request itself.
function emitToUser(namespace, userId, event, payload) {
    try {
        getIo().of(namespace).to(`user:${userId}`).emit(event, payload);
    }
    catch (err) {
        console.error(`Failed to emit ${event} to user ${userId}:`, err);
    }
}
//# sourceMappingURL=io.js.map