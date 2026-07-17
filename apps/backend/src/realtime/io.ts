import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from '../services/auth.service';

// Sockets carry the authenticated user on `socket.data.user`, populated by the
// namespace auth middleware below (same JWT + cookie as the HTTP requireAuth guard).
export interface AuthedSocket extends Socket {
  data: { user: AuthTokenPayload };
}

let io: Server | null = null;

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

function authenticate(socket: Socket, next: (err?: Error) => void): void {
  try {
    const token =
      parseCookie(socket.handshake.headers.cookie, AUTH_COOKIE_NAME) ??
      // Also accept a handshake auth token, for non-cookie clients and tests.
      (socket.handshake.auth?.token as string | undefined);
    if (!token) {
      next(new Error('Not authenticated'));
      return;
    }
    (socket as AuthedSocket).data.user = verifyAuthToken(token);
    next();
  } catch {
    next(new Error('Invalid or expired session'));
  }
}

// Attaches Socket.io to the HTTP server. Two namespaces:
//   /dyas     — streaming AI assistant replies (Phase 2)
//   /projects — live teacher feedback on shared practice projects (Phase 3)
// Both authenticate every connection and drop each user into a private
// `user:<id>` room so services can target a specific user's sockets.
export function initRealtime(httpServer: HttpServer): Server {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    process.env.APP_URL || 'http://localhost:4201',
  ];

  io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  const dyas = io.of('/dyas');
  dyas.use(authenticate);
  dyas.on('connection', (socket) => {
    socket.join(`user:${(socket as AuthedSocket).data.user.sub}`);
  });

  const projects = io.of('/projects');
  projects.use(authenticate);
  projects.on('connection', (socket) => {
    socket.join(`user:${(socket as AuthedSocket).data.user.sub}`);
    // Clients subscribe to a project room to receive its live feedback.
    // NOTE (Phase 3): verify the user may view the project before joining once
    // PracticeProject visibility rules exist — no project events are emitted yet.
    socket.on('project:subscribe', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
    socket.on('project:unsubscribe', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) {
    throw new Error('Realtime not initialized. Call initRealtime() before getIo().');
  }
  return io;
}

// Fire-and-forget emit to one user's sockets on a namespace. Safe to call from
// HTTP controllers: realtime being down must never fail the request itself.
export function emitToUser(
  namespace: '/dyas' | '/projects',
  userId: string,
  event: string,
  payload: unknown,
): void {
  try {
    getIo().of(namespace).to(`user:${userId}`).emit(event, payload);
  } catch (err) {
    console.error(`Failed to emit ${event} to user ${userId}:`, err);
  }
}
