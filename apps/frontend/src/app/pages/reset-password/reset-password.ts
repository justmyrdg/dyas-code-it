import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  // Bound from the ?token= query param via withComponentInputBinding().
  readonly token = input<string | undefined>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitError = signal<string | undefined>(undefined);
  readonly passwordMismatch = signal(false);

  newPassword = '';
  confirmPassword = '';

  readonly hasToken = computed(() => !!this.token());

  async onSubmit(): Promise<void> {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }
    this.passwordMismatch.set(false);
    this.submitError.set(undefined);

    const token = this.token();
    if (!token) {
      this.submitError.set('This reset link is invalid or has expired.');
      return;
    }

    this.submitting.set(true);
    try {
      await this.authService.resetPassword({ token, newPassword: this.newPassword });
      await this.router.navigate(['/login'], { queryParams: { reset: 'success' } });
    } catch (err) {
      this.submitError.set(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
