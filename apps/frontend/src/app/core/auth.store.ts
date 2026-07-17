import { computed, inject, Injectable, signal } from '@angular/core';
import type { AuthUser } from '../models/auth-user.model';
import { AuthService } from '../services/auth.service';

export type AuthStatus = 'unknown' | 'authenticated' | 'guest';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);

  readonly user = signal<AuthUser | null>(null);
  readonly status = signal<AuthStatus>('unknown');
  readonly role = computed(() => this.user()?.role ?? null);

  private loadPromise: Promise<void> | null = null;

  // Single-flight: concurrent guard activations share one /auth/me call.
  ensureLoaded(): Promise<void> {
    if (this.status() !== 'unknown') {
      return Promise.resolve();
    }
    this.loadPromise ??= this.authService
      .me()
      .then((user) => this.applyUser(user))
      .catch(() => this.applyUser(null))
      .finally(() => {
        this.loadPromise = null;
      });
    return this.loadPromise;
  }

  setUser(user: AuthUser): void {
    this.applyUser(user);
  }

  clear(): void {
    this.applyUser(null);
  }

  private applyUser(user: AuthUser | null): void {
    this.user.set(user);
    this.status.set(user ? 'authenticated' : 'guest');
  }
}
