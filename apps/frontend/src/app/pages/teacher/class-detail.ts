import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TeacherService, type IntegrityReport } from '../../services/teacher.service';
import type {
  Topic,
  GradingQueueItem,
  TeacherSubmissionDetail,
  ManualGrade,
} from '../../models/curriculum.model';
import type { ClassInfo, ClassProgress, ClassStudent } from '../../models/class.model';

@Component({
  selector: 'app-teacher-class-detail',
  imports: [RouterLink, FormsModule],
  templateUrl: './class-detail.html',
})
export class ClassDetail {
  readonly id = input.required<string>();

  private readonly teacher = inject(TeacherService);

  readonly klass = signal<ClassInfo | null>(null);
  readonly topic = signal<Pick<Topic, 'id' | 'name' | 'description'> | null>(null);
  readonly students = signal<ClassStudent[]>([]);
  readonly maxStudents = signal(50);
  readonly progress = signal<ClassProgress | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly toggling = signal(false);
  readonly copied = signal(false);

  // Assessment grading queue (submissions awaiting manual review).
  readonly gradingQueue = signal<GradingQueueItem[]>([]);
  readonly openSubmission = signal<TeacherSubmissionDetail | null>(null);
  readonly gradeInputs = signal<Record<number, { score: number; comment: string }>>({});
  readonly savingGrades = signal(false);

  // Integrity report (code similarity + behavioral flags). Advisory only.
  readonly integrity = signal<IntegrityReport | null>(null);

  constructor() {
    effect(() => {
      const classId = this.id();
      void this.load(classId);
    });
  }

  private async load(classId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const [detail, progress, queue] = await Promise.all([
        this.teacher.getClass(classId),
        this.teacher.getClassProgress(classId),
        this.teacher.getGradingQueue(classId),
      ]);
      this.klass.set(detail.class);
      this.topic.set(detail.topic);
      this.students.set(detail.students);
      this.maxStudents.set(detail.maxStudents);
      this.progress.set(progress);
      this.gradingQueue.set(queue);
      // Integrity report is advisory — never block the page on it.
      this.teacher
        .getIntegrityReport(classId)
        .then((report) => this.integrity.set(report))
        .catch(() => this.integrity.set(null));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load class.');
    } finally {
      this.loading.set(false);
    }
  }

  async openForGrading(submissionId: string): Promise<void> {
    this.error.set(undefined);
    try {
      const detail = await this.teacher.getSubmission(submissionId);
      this.openSubmission.set(detail);
      // Seed score inputs from any existing feedback for the short-answer questions.
      const inputs: Record<number, { score: number; comment: string }> = {};
      detail.submission.feedback.forEach((f, i) => {
        if (!f.autoGraded) inputs[i] = { score: f.score, comment: f.comment };
      });
      this.gradeInputs.set(inputs);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load submission.');
    }
  }

  closeGrading(): void {
    this.openSubmission.set(null);
    this.gradeInputs.set({});
  }

  setGradeScore(index: number, score: number): void {
    this.gradeInputs.update((inputs) => ({ ...inputs, [index]: { ...inputs[index], score } }));
  }

  setGradeComment(index: number, comment: string): void {
    this.gradeInputs.update((inputs) => ({ ...inputs, [index]: { ...inputs[index], comment } }));
  }

  answerText(index: number): string {
    const answer = this.openSubmission()?.submission.answers[index] as { text?: string } | undefined;
    return answer?.text ?? '';
  }

  scoreFor(index: number): number {
    return this.gradeInputs()[index]?.score ?? 0;
  }

  commentFor(index: number): string {
    return this.gradeInputs()[index]?.comment ?? '';
  }

  async saveGrades(): Promise<void> {
    const detail = this.openSubmission();
    if (!detail) return;
    this.savingGrades.set(true);
    this.error.set(undefined);
    try {
      const inputs = this.gradeInputs();
      const grades: ManualGrade[] = Object.entries(inputs).map(([index, v]) => ({
        index: Number(index),
        score: v.score,
        comment: v.comment,
      }));
      await this.teacher.gradeSubmission(detail.submission.id, grades);
      this.closeGrading();
      this.gradingQueue.set(await this.teacher.getGradingQueue(this.id()));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to save grades.');
    } finally {
      this.savingGrades.set(false);
    }
  }

  async toggleActive(): Promise<void> {
    const current = this.klass();
    if (!current) return;
    this.toggling.set(true);
    this.error.set(undefined);
    try {
      const updated = await this.teacher.updateClass(current.id, { active: !current.active });
      this.klass.set(updated);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to update class.');
    } finally {
      this.toggling.set(false);
    }
  }

  async copyCode(): Promise<void> {
    const current = this.klass();
    if (!current) return;
    await navigator.clipboard.writeText(current.classCode);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  completionFor(studentId: string): { completed: number; total: number } {
    const progress = this.progress();
    const row = progress?.students.find((s) => s.id === studentId);
    return { completed: row?.completedLessons ?? 0, total: progress?.totalLessons ?? 0 };
  }
}
