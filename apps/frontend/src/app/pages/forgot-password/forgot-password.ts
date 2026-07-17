import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);

  email = '';
  readonly submitting = signal(false);
  readonly submitted = signal(false);

  async onSubmit(): Promise<void> {
    this.submitting.set(true);
    try {
      await this.authService.forgotPassword({ email: this.email });
    } finally {
      this.submitting.set(false);
      this.submitted.set(true);
    }
  }
}
