import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminCurriculumService } from '../../services/admin-curriculum.service';
import { CodeBlock } from '../../core/code-block';
import type {
  ActivityType,
  AssessmentQuestion,
  Chapter,
  ChapterAssessment,
  CodeExample,
  Lesson,
  MiniActivity,
  QuestionType,
  TopicTree,
} from '../../models/curriculum.model';

interface TestCaseDraft {
  stdin: string;
  expectedStdout: string;
}

// Editable draft for one assessment question; type-specific fields are all present but only
// the ones relevant to `type` are read when building the payload.
interface QuestionDraft {
  type: QuestionType;
  prompt: string;
  points: number;
  options: string[];
  correctIndex: number;
  language: string;
  testCases: TestCaseDraft[];
}

@Component({
  selector: 'app-admin-topic-editor',
  imports: [RouterLink, FormsModule, CodeBlock],
  templateUrl: './topic-editor.html',
})
export class TopicEditor {
  // Route param via withComponentInputBinding().
  readonly id = input.required<string>();

  private readonly curriculum = inject(AdminCurriculumService);

  readonly topic = signal<TopicTree | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly saving = signal(false);

  // Chapter create form
  readonly showChapterForm = signal(false);
  chapterTitle = '';
  chapterDescription = '';

  // Lesson form: open for one chapter at a time; lessonId set = editing.
  readonly lessonFormChapterId = signal<string | null>(null);
  readonly editingLessonId = signal<string | null>(null);
  lessonTitle = '';
  lessonContent = '';
  lessonObjectives = '';
  examples: CodeExample[] = [];

  // Activity form: open for one lesson at a time; activityId set = editing.
  readonly activityFormLessonId = signal<string | null>(null);
  readonly editingActivityId = signal<string | null>(null);
  activityType: ActivityType = 'quiz';
  activityPrompt = '';
  quizOptions: string[] = ['', ''];
  quizCorrectIndex = 0;
  blankAnswers: string[] = [''];
  codeLanguage = 'python';
  codeStarter = '';
  testCases: TestCaseDraft[] = [{ stdin: '', expectedStdout: '' }];

  // Assessment form: open for one chapter at a time; assessmentId set = editing.
  readonly assessmentFormChapterId = signal<string | null>(null);
  readonly editingAssessmentId = signal<string | null>(null);
  assessmentTitle = '';
  assessmentPassingScore = 70;
  assessmentCooldown = 24;
  assessmentQuestions: QuestionDraft[] = [];

  constructor() {
    effect(() => {
      const topicId = this.id();
      void this.load(topicId);
    });
  }

  private async load(topicId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      this.topic.set(await this.curriculum.getTopic(topicId));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load topic.');
    } finally {
      this.loading.set(false);
    }
  }

  private async reload(): Promise<void> {
    await this.load(this.id());
  }

  async setStatus(status: 'draft' | 'published' | 'archived'): Promise<void> {
    await this.run(() => this.curriculum.updateTopic(this.id(), { status }));
  }

  async addChapter(): Promise<void> {
    if (!this.chapterTitle.trim()) return;
    await this.run(async () => {
      await this.curriculum.createChapter(this.id(), {
        title: this.chapterTitle,
        description: this.chapterDescription || undefined,
      });
      this.chapterTitle = '';
      this.chapterDescription = '';
      this.showChapterForm.set(false);
    });
  }

  async deleteChapter(chapter: Chapter): Promise<void> {
    await this.run(() => this.curriculum.deleteChapter(chapter.id));
  }

  openLessonForm(chapterId: string, lesson?: Lesson): void {
    this.lessonFormChapterId.set(chapterId);
    this.editingLessonId.set(lesson?.id ?? null);
    this.lessonTitle = lesson?.title ?? '';
    this.lessonContent = lesson?.content ?? '';
    this.lessonObjectives = lesson?.learningObjectives ?? '';
    this.examples = lesson ? lesson.codeExamples.map((ex) => ({ ...ex })) : [];
  }

  closeLessonForm(): void {
    this.lessonFormChapterId.set(null);
    this.editingLessonId.set(null);
  }

  addExample(): void {
    this.examples.push({ language: 'python', code: '', description: '', expectedOutput: '' });
  }

  removeExample(index: number): void {
    this.examples.splice(index, 1);
  }

  async saveLesson(): Promise<void> {
    if (!this.lessonTitle.trim() || !this.lessonContent.trim()) return;
    const payload = {
      title: this.lessonTitle,
      content: this.lessonContent,
      learningObjectives: this.lessonObjectives || undefined,
      codeExamples: this.examples.filter((ex) => ex.code.trim()),
    };
    await this.run(async () => {
      const editingId = this.editingLessonId();
      if (editingId) {
        await this.curriculum.updateLesson(editingId, payload);
      } else {
        await this.curriculum.createLesson(this.lessonFormChapterId()!, payload);
      }
      this.closeLessonForm();
    });
  }

  async deleteLesson(lesson: Lesson): Promise<void> {
    await this.run(() => this.curriculum.deleteLesson(lesson.id));
  }

  // --- Activities ---

  openActivityForm(lessonId: string, activity?: MiniActivity): void {
    this.activityFormLessonId.set(lessonId);
    this.editingActivityId.set(activity?.id ?? null);
    this.activityType = activity?.type ?? 'quiz';
    this.activityPrompt = activity?.prompt ?? '';
    const cfg = (activity?.config ?? {}) as Record<string, unknown>;
    this.quizOptions = Array.isArray(cfg['options']) ? [...(cfg['options'] as string[])] : ['', ''];
    this.quizCorrectIndex = typeof cfg['correctIndex'] === 'number' ? (cfg['correctIndex'] as number) : 0;
    this.blankAnswers = Array.isArray(cfg['answers']) ? [...(cfg['answers'] as string[])] : [''];
    this.codeLanguage = typeof cfg['language'] === 'string' ? (cfg['language'] as string) : 'python';
    this.codeStarter = typeof cfg['starterCode'] === 'string' ? (cfg['starterCode'] as string) : '';
    this.testCases = Array.isArray(cfg['testCases'])
      ? (cfg['testCases'] as TestCaseDraft[]).map((t) => ({ ...t }))
      : [{ stdin: '', expectedStdout: '' }];
  }

  closeActivityForm(): void {
    this.activityFormLessonId.set(null);
    this.editingActivityId.set(null);
  }

  get isCodeActivity(): boolean {
    return this.activityType === 'code_challenge' || this.activityType === 'debug';
  }

  addOption(): void {
    this.quizOptions.push('');
  }
  removeOption(index: number): void {
    this.quizOptions.splice(index, 1);
    if (this.quizCorrectIndex >= this.quizOptions.length) this.quizCorrectIndex = 0;
  }
  addBlank(): void {
    this.blankAnswers.push('');
  }
  removeBlank(index: number): void {
    this.blankAnswers.splice(index, 1);
  }
  addTestCase(): void {
    this.testCases.push({ stdin: '', expectedStdout: '' });
  }
  removeTestCase(index: number): void {
    this.testCases.splice(index, 1);
  }

  private buildActivityConfig(): Record<string, unknown> {
    if (this.activityType === 'quiz') {
      return { options: this.quizOptions.map((o) => o.trim()).filter(Boolean), correctIndex: this.quizCorrectIndex };
    }
    if (this.activityType === 'fill_blank') {
      return { answers: this.blankAnswers.map((a) => a.trim()).filter(Boolean) };
    }
    return {
      language: this.codeLanguage,
      starterCode: this.codeStarter,
      testCases: this.testCases.filter((t) => t.expectedStdout.trim() || t.stdin.trim()),
    };
  }

  async saveActivity(): Promise<void> {
    if (!this.activityPrompt.trim()) return;
    const config = this.buildActivityConfig();
    await this.run(async () => {
      const editingId = this.editingActivityId();
      if (editingId) {
        await this.curriculum.updateActivity(editingId, { prompt: this.activityPrompt, config });
      } else {
        await this.curriculum.createActivity(this.activityFormLessonId()!, {
          type: this.activityType,
          prompt: this.activityPrompt,
          config,
        });
      }
      this.closeActivityForm();
    });
  }

  async deleteActivity(activity: MiniActivity): Promise<void> {
    await this.run(() => this.curriculum.deleteActivity(activity.id));
  }

  // --- Assessments ---

  private emptyQuestion(type: QuestionType): QuestionDraft {
    return { type, prompt: '', points: 1, options: ['', ''], correctIndex: 0, language: 'python', testCases: [{ stdin: '', expectedStdout: '' }] };
  }

  openAssessmentForm(chapterId: string, assessment?: ChapterAssessment): void {
    this.assessmentFormChapterId.set(chapterId);
    this.editingAssessmentId.set(assessment?.id ?? null);
    this.assessmentTitle = assessment?.title ?? '';
    this.assessmentPassingScore = assessment?.passingScore ?? 70;
    this.assessmentCooldown = assessment?.retryCooldownHours ?? 24;
    this.assessmentQuestions = (assessment?.questions ?? []).map((q) => {
      const draft = this.emptyQuestion(q.type);
      draft.prompt = q.prompt;
      draft.points = q.points;
      if (q.type === 'mcq') {
        draft.options = Array.isArray(q.config['options']) ? [...(q.config['options'] as string[])] : ['', ''];
        draft.correctIndex = typeof q.config['correctIndex'] === 'number' ? (q.config['correctIndex'] as number) : 0;
      } else if (q.type === 'code') {
        draft.language = (q.config['language'] as string) ?? 'python';
        draft.testCases = Array.isArray(q.config['testCases'])
          ? (q.config['testCases'] as TestCaseDraft[]).map((t) => ({ ...t }))
          : [{ stdin: '', expectedStdout: '' }];
      }
      return draft;
    });
  }

  closeAssessmentForm(): void {
    this.assessmentFormChapterId.set(null);
    this.editingAssessmentId.set(null);
  }

  addQuestion(type: QuestionType): void {
    this.assessmentQuestions.push(this.emptyQuestion(type));
  }
  removeQuestion(index: number): void {
    this.assessmentQuestions.splice(index, 1);
  }
  addQuestionOption(question: QuestionDraft): void {
    question.options.push('');
  }
  removeQuestionOption(question: QuestionDraft, index: number): void {
    question.options.splice(index, 1);
    if (question.correctIndex >= question.options.length) question.correctIndex = 0;
  }
  addQuestionTestCase(question: QuestionDraft): void {
    question.testCases.push({ stdin: '', expectedStdout: '' });
  }
  removeQuestionTestCase(question: QuestionDraft, index: number): void {
    question.testCases.splice(index, 1);
  }

  private buildQuestions(): AssessmentQuestion[] {
    return this.assessmentQuestions.map((q) => {
      let config: Record<string, unknown> = {};
      if (q.type === 'mcq') {
        config = { options: q.options.map((o) => o.trim()).filter(Boolean), correctIndex: q.correctIndex };
      } else if (q.type === 'code') {
        config = { language: q.language, testCases: q.testCases.filter((t) => t.expectedStdout.trim() || t.stdin.trim()) };
      }
      return { type: q.type, prompt: q.prompt, points: q.points, config };
    });
  }

  async saveAssessment(): Promise<void> {
    if (!this.assessmentTitle.trim() || this.assessmentQuestions.length === 0) return;
    const payload = {
      title: this.assessmentTitle,
      passingScore: this.assessmentPassingScore,
      retryCooldownHours: this.assessmentCooldown,
      questions: this.buildQuestions(),
    };
    await this.run(async () => {
      const editingId = this.editingAssessmentId();
      if (editingId) {
        await this.curriculum.updateAssessment(editingId, payload);
      } else {
        await this.curriculum.createAssessment(this.assessmentFormChapterId()!, payload);
      }
      this.closeAssessmentForm();
    });
  }

  async deleteAssessment(assessment: ChapterAssessment): Promise<void> {
    await this.run(() => this.curriculum.deleteAssessment(assessment.id));
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    this.saving.set(true);
    this.error.set(undefined);
    try {
      await action();
      await this.reload();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      this.saving.set(false);
    }
  }
}
