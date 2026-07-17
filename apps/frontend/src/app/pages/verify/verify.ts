import { Component, effect, inject, input, signal } from '@angular/core';
import { PracticeService } from '../../services/practice.service';
import type { CertificateVerification } from '../../models/practice.model';

// Public certificate verification page — the QR code target. No auth guard.
@Component({
  selector: 'app-verify',
  imports: [],
  templateUrl: './verify.html',
})
export class VerifyPage {
  readonly code = input.required<string>();

  private readonly practice = inject(PracticeService);

  readonly result = signal<CertificateVerification | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  constructor() {
    effect(() => {
      void this.load(this.code());
    });
  }

  private async load(code: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    try {
      this.result.set(await this.practice.verifyCertificate(code));
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
