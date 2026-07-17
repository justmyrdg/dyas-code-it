import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import type {
  StudentAssessment,
  AssessmentSubmissionRecord,
  AssessmentQuestion,
} from '../../models/curriculum.model';

// Student assessment portal: renders the questions, collects one answer per question, submits
// for grading, and shows the resulting score / pending-review / pass-fail state plus retry
// availability (cooldown enforced server-side).
@Component({
  selector: 'app-student-assessment',
  imports: [RouterLink, FormsModule],
  templateUrl: './assessment.html',
})
export class AssessmentPage {
  readonly classId = input.required<string>();
  readonly assessmentId = input.required<string>();

  private readonly student = inject(StudentService);

  readonly assessment = signal<StudentAssessment | null>(null);
  readonly submissions = signal<AssessmentSubmissionRecord[]>([]);
  readonly answers = signal<Record<string, unknown>[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | undefined>(undefined);

  // Most recent attempt drives the status banner + whether the form is shown.
  readonly latest = computed(() => {
    const subs = this.submissions();
    return subs.length ? subs[subs.length - 1] : null;
  });

  readonly alreadyPassed = computed(() => this.latest()?.status === 'passed');
  readonly awaitingGrading = computed(() => this.latest()?.status === 'pending');

  // Integrity metadata: advisory signals surfaced to the teacher, never
  // auto-punitive. Captured for the lifetime of this page.
  private tabSwitches = 0;
  private pastedChars = 0;
  private readonly startedAt = Date.now();

  constructor() {
    effect(() => {
      const classId = this.classId();
      const assessmentId = this.assessmentId();
      void this.load(classId, assessmentId);
    });

    const destroyRef = inject(DestroyRef);
    const onVisibility = (): void => {
      if (document.visibilityState === 'hidden') this.tabSwitches++;
    };
    const onPaste = (event: ClipboardEvent): void => {
      this.pastedChars += event.clipboardData?.getData('text').length ?? 0;
    };
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('paste', onPaste);
    destroyRef.onDestroy(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('paste', onPaste);
    });
  }

  private async load(classId: string, assessmentId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const body = await this.student.getAssessment(classId, assessmentId);
      this.assessment.set(body.assessment);
      this.submissions.set(body.submissions);
      this.resetAnswers(body.assessment.questions);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load assessment.');
    } finally {
      this.loading.set(false);
    }
  }

  private resetAnswers(questions: AssessmentQuestion[]): void {
    this.answers.set(
      questions.map((q) => {
        if (q.type === 'mcq') return { selectedIndex: null };
        if (q.type === 'code') return { source: (q.config['starterCode'] as string) ?? '' };
        return { text: '' };
      }),
    );
  }

  setAnswer(index: number, patch: Record<string, unknown>): void {
    const next = [...this.answers()];
    next[index] = { ...next[index], ...patch };
    this.answers.set(next);
  }

  optionsOf(question: AssessmentQuestion): string[] {
    return (question.config['options'] as string[]) ?? [];
  }

  async submit(): Promise<void> {
    this.submitting.set(true);
    this.error.set(undefined);
    try {
      const body = await this.student.submitAssessment(this.classId(), this.assessmentId(), this.answers(), {
        tabSwitches: this.tabSwitches,
        pastedChars: this.pastedChars,
        timeSpentSeconds: Math.round((Date.now() - this.startedAt) / 1000),
      });
      this.submissions.update((subs) => [...subs, body.submission]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to submit assessment.');
    } finally {
      this.submitting.set(false);
    }
  }
}
