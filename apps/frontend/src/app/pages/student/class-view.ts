import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { PracticeService } from '../../services/practice.service';
import type { ClassCurriculum } from '../../models/class.model';
import type { CertificateEligibility } from '../../models/practice.model';

@Component({
  selector: 'app-student-class-view',
  imports: [RouterLink],
  templateUrl: './class-view.html',
})
export class ClassView {
  readonly classId = input.required<string>();

  private readonly student = inject(StudentService);
  private readonly practice = inject(PracticeService);
  private readonly router = inject(Router);

  readonly data = signal<ClassCurriculum | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);

  readonly eligibility = signal<CertificateEligibility | null>(null);
  readonly claiming = signal(false);

  readonly completedLessonIds = computed(() => {
    const progress = this.data()?.progress ?? [];
    return new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  });

  constructor() {
    effect(() => {
      const id = this.classId();
      void this.load(id);
    });
  }

  private async load(classId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      this.data.set(await this.student.getClassCurriculum(classId));
      // Eligibility is non-critical — don't block the page on it.
      this.practice
        .getEligibility(classId)
        .then((e) => this.eligibility.set(e))
        .catch(() => this.eligibility.set(null));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load class.');
    } finally {
      this.loading.set(false);
    }
  }

  async claimCertificate(): Promise<void> {
    this.claiming.set(true);
    this.error.set(undefined);
    try {
      const certificate = await this.practice.claimCertificate(this.classId());
      await this.router.navigate(['/student/certificates', certificate.id]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to claim certificate.');
    } finally {
      this.claiming.set(false);
    }
  }
}
