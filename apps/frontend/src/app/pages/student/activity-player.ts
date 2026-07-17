import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import type { StudentActivity, GradeResult, ActivitySubmissionRecord } from '../../models/curriculum.model';

// Renders a single mini-activity (quiz, fill-in-the-blank, or code challenge / debug), collects
// the student's answer, submits it for grading, and shows instant feedback. Retryable.
@Component({
  selector: 'app-activity-player',
  imports: [FormsModule],
  templateUrl: './activity-player.html',
})
export class ActivityPlayer {
  readonly classId = input.required<string>();
  readonly activity = input.required<StudentActivity>();
  readonly priorSubmissions = input<ActivitySubmissionRecord[]>([]);

  private readonly student = inject(StudentService);

  readonly selectedIndex = signal<number | null>(null);
  readonly blankValues = signal<string[]>([]);
  readonly source = signal('');
  readonly submitting = signal(false);
  readonly result = signal<GradeResult | null>(null);
  readonly error = signal<string | undefined>(undefined);

  readonly isCode = computed(() => {
    const t = this.activity().type;
    return t === 'code_challenge' || t === 'debug';
  });

  // Best score across this student's earlier attempts, so the UI can show prior progress.
  readonly bestPrior = computed(() => {
    const subs = this.priorSubmissions();
    if (subs.length === 0) return null;
    return subs.reduce((best, s) => (s.score > best.score ? s : best));
  });

  constructor() {
    effect(() => {
      const a = this.activity();
      this.selectedIndex.set(null);
      this.blankValues.set(new Array(a.config.blankCount ?? 0).fill(''));
      this.source.set(a.config.starterCode ?? '');
      this.result.set(null);
      this.error.set(undefined);
    });
  }

  setBlank(index: number, value: string): void {
    const next = [...this.blankValues()];
    next[index] = value;
    this.blankValues.set(next);
  }

  private buildAnswer(): unknown | null {
    const type = this.activity().type;
    if (type === 'quiz') {
      if (this.selectedIndex() === null) return null;
      return { selectedIndex: this.selectedIndex() };
    }
    if (type === 'fill_blank') {
      return { values: this.blankValues() };
    }
    // code_challenge / debug
    if (!this.source().trim()) return null;
    return { source: this.source() };
  }

  async submit(): Promise<void> {
    const answer = this.buildAnswer();
    if (answer === null) {
      this.error.set('Please provide an answer before submitting.');
      return;
    }
    this.submitting.set(true);
    this.error.set(undefined);
    try {
      const body = await this.student.submitActivity(this.classId(), this.activity().id, answer);
      this.result.set(body.result);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to submit.');
    } finally {
      this.submitting.set(false);
    }
  }
}
