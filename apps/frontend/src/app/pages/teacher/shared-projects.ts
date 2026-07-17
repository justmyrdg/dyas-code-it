import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PracticeService } from '../../services/practice.service';
import { CodeBlock } from '../../core/code-block';
import type { PracticeProject, ProjectVersion } from '../../models/practice.model';

// Teacher view of practice projects students have shared: browse, open one,
// read version history, and leave non-graded feedback on a version.
@Component({
  selector: 'app-shared-projects',
  imports: [FormsModule, CodeBlock],
  templateUrl: './shared-projects.html',
})
export class SharedProjects {
  private readonly practice = inject(PracticeService);

  readonly projects = signal<PracticeProject[]>([]);
  readonly selected = signal<PracticeProject | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);

  readonly feedbackDrafts = signal<Record<string, string>>({});
  readonly savingFeedback = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      this.projects.set(await this.practice.listSharedProjects());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load shared projects.');
    } finally {
      this.loading.set(false);
    }
  }

  async open(projectId: string): Promise<void> {
    this.error.set(undefined);
    try {
      this.selected.set(await this.practice.getSharedProject(projectId));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load project.');
    }
  }

  close(): void {
    this.selected.set(null);
  }

  draftFor(versionId: string): string {
    return this.feedbackDrafts()[versionId] ?? '';
  }

  setDraft(versionId: string, value: string): void {
    this.feedbackDrafts.update((d) => ({ ...d, [versionId]: value }));
  }

  async sendFeedback(version: ProjectVersion): Promise<void> {
    const project = this.selected();
    const feedback = this.draftFor(version.id).trim();
    if (!project || !feedback) return;
    this.savingFeedback.set(version.id);
    this.error.set(undefined);
    try {
      const updated = await this.practice.leaveFeedback(project.id, version.id, feedback);
      this.selected.update((p) =>
        p
          ? {
              ...p,
              versions: p.versions?.map((v) => (v.id === updated.id ? updated : v)),
            }
          : p,
      );
      this.setDraft(version.id, '');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to send feedback.');
    } finally {
      this.savingFeedback.set(null);
    }
  }
}
