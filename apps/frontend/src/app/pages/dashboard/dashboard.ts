import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth.store';
import { dashboardPathFor } from '../../core/auth.guards';

// Landing spot after login and OAuth callbacks: forwards to the user's role area.
// authGuard guarantees the store is loaded and the user is signed in by the time
// this component is constructed.
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor() {
    const store = inject(AuthStore);
    const router = inject(Router);
    const role = store.role();
    // Deferred so we don't cancel the navigation that is activating this component.
    queueMicrotask(() => {
      void router.navigateByUrl(role ? dashboardPathFor(role) : '/login', { replaceUrl: true });
    });
  }
}
