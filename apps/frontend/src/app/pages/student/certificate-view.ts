import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PracticeService } from '../../services/practice.service';
import type { CertificateRecord } from '../../models/practice.model';

// Printable certificate with its QR verification code.
@Component({
  selector: 'app-certificate-view',
  imports: [RouterLink],
  templateUrl: './certificate-view.html',
})
export class CertificateView {
  readonly id = input.required<string>();

  private readonly practice = inject(PracticeService);

  readonly certificate = signal<CertificateRecord | null>(null);
  readonly verifyUrl = signal('');
  readonly qrDataUrl = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      void this.load(this.id());
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const body = await this.practice.getCertificate(id);
      this.certificate.set(body.certificate);
      this.verifyUrl.set(body.verifyUrl);
      this.qrDataUrl.set(body.qrDataUrl);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load certificate.');
    } finally {
      this.loading.set(false);
    }
  }

  print(): void {
    window.print();
  }
}
