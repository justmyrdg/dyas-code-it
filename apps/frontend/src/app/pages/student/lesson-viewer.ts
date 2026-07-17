import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { CodeBlock } from '../../core/code-block';
import { CodeEditor } from '../../core/code-editor';
import { ActivityPlayer } from './activity-player';
import type { Lesson, StudentActivity, ActivitySubmissionRecord } from '../../models/curriculum.model';
import type { LessonProgress } from '../../models/class.model';

// Languages the backend executor can run, keyed by the aliases authors may type.
const RUNNABLE_LANGUAGES: Record<string, string> = {
  python: 'python',
  py: 'python',
  javascript: 'javascript',
  js: 'javascript',
  cpp: 'cpp',
  'c++': 'cpp',
  java: 'java',
};

@Component({
  selector: 'app-student-lesson-viewer',
  imports: [RouterLink, CodeBlock, CodeEditor, ActivityPlayer],
  templateUrl: './lesson-viewer.html',
})
export class LessonViewer {
  readonly classId = input.required<string>();
  readonly lessonId = input.required<string>();

  private readonly student = inject(StudentService);

  readonly lesson = signal<Lesson | null>(null);
  readonly progress = signal<LessonProgress | null>(null);
  readonly activities = signal<StudentActivity[]>([]);
  readonly submissions = signal<ActivitySubmissionRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly completing = signal(false);

  submissionsFor(activityId: string): ActivitySubmissionRecord[] {
    return this.submissions().filter((s) => s.activityId === activityId);
  }

  constructor() {
    effect(() => {
      const classId = this.classId();
      const lessonId = this.lessonId();
      void this.load(classId, lessonId);
    });
  }

  private async load(classId: string, lessonId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const body = await this.student.getLesson(classId, lessonId);
      this.lesson.set(body.lesson);
      this.progress.set(body.progress);
      this.activities.set(body.activities ?? []);
      this.submissions.set(body.submissions ?? []);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load lesson.');
    } finally {
      this.loading.set(false);
    }
  }

  // Returns the executor's internal language id if this example can be run, else null.
  runnableLanguage(language: string): string | null {
    return RUNNABLE_LANGUAGES[language.trim().toLowerCase()] ?? null;
  }

  async markComplete(): Promise<void> {
    this.completing.set(true);
    this.error.set(undefined);
    try {
      this.progress.set(await this.student.completeLesson(this.classId(), this.lessonId()));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to mark lesson complete.');
    } finally {
      this.completing.set(false);
    }
  }
}
