import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../core/auth.store';

type LoginRole = 'student' | 'teacher';
type AuthMode = 'signin' | 'register';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  // Bound from the ?role= query param via withComponentInputBinding().
  readonly role = input<string | undefined>();

  // Bound from ?error=oauth_failed on the redirect back from a failed OAuth attempt.
  // Register/login failures are handled by submitError below instead — they're AJAX calls, not redirects.
  readonly error = input<string | undefined>();

  // Bound from ?reset=success after a completed password reset.
  readonly reset = input<string | undefined>();

  readonly apiUrl = environment.apiUrl;

  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitError = signal<string | undefined>(undefined);

  readonly errorMessage = computed(() => {
    if (this.submitError()) {
      return this.submitError();
    }
    if (this.error() === 'oauth_failed') {
      return 'Something went wrong signing in with that provider. Please try again.';
    }
    return undefined;
  });

  readonly successMessage = computed(() =>
    this.reset() === 'success' ? 'Password updated. Please sign in.' : undefined,
  );

  readonly activeRole = computed<LoginRole>(() =>
    this.role() === 'teacher' ? 'teacher' : 'student',
  );

  readonly headingLine1 = computed(() =>
    this.activeRole() === 'student' ? 'Start learning with' : 'Launch and manage',
  );
  readonly headingLine2 = computed(() =>
    this.activeRole() === 'student' ? 'your class code' : 'your coding classes',
  );

  readonly description = computed(() =>
    this.activeRole() === 'student'
      ? 'Sign in, join a class, complete lessons, and ask Dyas for guidance along the way.'
      : 'Sign in to create classes from published curriculum, share enrollment codes, and track progress.',
  );

  readonly helper = computed(() =>
    this.activeRole() === 'student'
      ? "You'll join with a six-character class code right after signing in."
      : 'Your free plan starts with two classes, 50 students each.',
  );

  readonly benefits = computed(() =>
    this.activeRole() === 'student'
      ? [
          'Runnable lessons in every browser — no installs',
          'Dyas AI tutor guides without giving answers',
          'Certificates anyone can verify with one scan',
        ]
      : [
          'Spin up a class from ready-made curriculum in minutes',
          'Live progress dashboard for every student',
          'Free plan: 2 classes, 50 students each',
        ],
  );

  readonly mode = signal<AuthMode>('signin');
  readonly showEmailForm = signal(false);
  readonly passwordMismatch = signal(false);

  readonly showSignInPassword = signal(false);
  readonly showRegisterPassword = signal(false);
  readonly showRegisterConfirm = signal(false);

  signInEmail = '';
  signInPassword = '';

  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerConfirmPassword = '';

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.passwordMismatch.set(false);
  }

  async onSignInSubmit(): Promise<void> {
    this.submitError.set(undefined);
    this.submitting.set(true);
    try {
      const user = await this.authService.login({
        email: this.signInEmail,
        password: this.signInPassword,
      });
      this.authStore.setUser(user);
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async onRegisterSubmit(): Promise<void> {
    if (this.registerPassword !== this.registerConfirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }
    this.passwordMismatch.set(false);
    this.submitError.set(undefined);
    this.submitting.set(true);
    try {
      const user = await this.authService.register({
        name: this.registerName,
        email: this.registerEmail,
        password: this.registerPassword,
        role: this.activeRole(),
      });
      this.authStore.setUser(user);
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
