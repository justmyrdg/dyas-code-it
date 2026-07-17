import type { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { type AuthTokenPayload } from '../services/auth.service';
export interface AuthedSocket extends Socket {
    data: {
        user: AuthTokenPayload;
    };
}
export declare function initRealtime(httpServer: HttpServer): Server;
export declare function getIo(): Server;
export declare function emitToUser(namespace: '/dyas' | '/projects', userId: string, event: string, payload: unknown): void;
//# sourceMappingURL=io.d.ts.map