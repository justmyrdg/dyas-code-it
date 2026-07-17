import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import type { UserRole } from '../models/auth-user.model';
import { AuthStore } from './auth.store';

export function dashboardPathFor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'teacher':
      return '/teacher';
    default:
      return '/student';
  }
}

export const authGuard: CanActivateFn = async () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  await store.ensureLoaded();
  return store.status() === 'authenticated' ? true : router.createUrlTree(['/login']);
};

export function roleGuard(role: UserRole): CanActivateFn {
  return async () => {
    const store = inject(AuthStore);
    const router = inject(Router);
    await store.ensureLoaded();
    const currentRole = store.role();
    if (currentRole === role) {
      return true;
    }
    return router.createUrlTree([currentRole ? dashboardPathFor(currentRole) : '/login']);
  };
}

export const guestGuard: CanActivateFn = async () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  await store.ensureLoaded();
  const currentRole = store.role();
  return currentRole ? router.createUrlTree([dashboardPathFor(currentRole)]) : true;
};
