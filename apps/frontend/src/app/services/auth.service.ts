import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { AuthUser, UserRole } from '../models/auth-user.model';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  register(payload: RegisterPayload): Promise<AuthUser> {
    return this.request('/auth/register', payload);
  }

  login(payload: LoginPayload): Promise<AuthUser> {
    return this.request('/auth/login', payload);
  }

  async logout(): Promise<void> {
    await fetch(`${this.apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  async me(): Promise<AuthUser | null> {
    const response = await fetch(`${this.apiUrl}/auth/me`, { credentials: 'include' });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { user: AuthUser };
    return body.user;
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    // The backend always returns 200 with the same generic message, whether or
    // not the email is registered — nothing to branch on here.
    await fetch(`${this.apiUrl}/auth/forgot-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/reset-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: { code: string; message: string } };
      throw new Error(body.error?.message ?? 'This reset link is invalid or has expired.');
    }
  }

  private async request(path: string, payload: unknown): Promise<AuthUser> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as {
      user?: AuthUser;
      error?: { code: string; message: string };
    };

    if (!response.ok || !body.user) {
      throw new Error(body.error?.message ?? 'Something went wrong. Please try again.');
    }

    return body.user;
  }
}
