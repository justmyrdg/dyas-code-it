import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import type { EnrolledClass } from '../../models/class.model';

@Component({
  selector: 'app-student-my-classes',
  imports: [RouterLink, FormsModule],
  templateUrl: './my-classes.html',
})
export class MyClasses {
  private readonly student = inject(StudentService);

  readonly classes = signal<EnrolledClass[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly joining = signal(false);

  joinCode = '';

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      this.classes.set(await this.student.listMyClasses());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load classes.');
    } finally {
      this.loading.set(false);
    }
  }

  async join(): Promise<void> {
    if (!this.joinCode.trim()) return;
    this.joining.set(true);
    this.error.set(undefined);
    try {
      await this.student.joinClass(this.joinCode);
      this.joinCode = '';
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to join class.');
    } finally {
      this.joining.set(false);
    }
  }

  progressPercent(klass: EnrolledClass): number {
    return klass.totalLessons > 0 ? Math.round((klass.completedLessons / klass.totalLessons) * 100) : 0;
  }
}
