import { Injectable, type OnDestroy } from '@angular/core';
import { io, type Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

export type SocketNamespace = '/dyas' | '/projects';

// Thin wrapper over socket.io-client. Features (Dyas chat, live project feedback)
// ask for a namespace socket; this reuses one connection per namespace across the
// app. `withCredentials` sends the httpOnly auth cookie so the server authenticates
// the handshake with the same JWT as HTTP requests.
@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private readonly sockets = new Map<SocketNamespace, Socket>();

  connect(namespace: SocketNamespace): Socket {
    const existing = this.sockets.get(namespace);
    if (existing) return existing;

    const socket = io(`${environment.socketUrl}${namespace}`, {
      withCredentials: true,
      autoConnect: true,
    });
    this.sockets.set(namespace, socket);
    return socket;
  }

  disconnect(namespace: SocketNamespace): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }

  disconnectAll(): void {
    for (const socket of this.sockets.values()) {
      socket.disconnect();
    }
    this.sockets.clear();
  }

  ngOnDestroy(): void {
    this.disconnectAll();
  }
}
