import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../core/auth.store';
import { dashboardPathFor } from '../../core/auth.guards';
import { AuthService } from '../../services/auth.service';
import { GradeNotificationService } from '../../services/grade-notification.service';
import { DyasWidget } from '../../core/dyas-widget';

// Shared authenticated layout for the admin, teacher, and student areas.
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterOutlet, DyasWidget],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly store = inject(AuthStore);
  readonly gradeNotifications = inject(GradeNotificationService);

  readonly homePath = computed(() => {
    const role = this.store.role();
    return role ? dashboardPathFor(role) : '/login';
  });

  readonly roleLabel = computed(() => {
    switch (this.store.role()) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Teacher';
      default:
        return 'Student';
    }
  });

  constructor() {
    // Only students receive graded-submission events; don't open sockets for other roles.
    effect(() => {
      if (this.store.role() === 'student') {
        this.gradeNotifications.start();
      }
    });
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.store.clear();
    await this.router.navigate(['/login']);
  }
}
