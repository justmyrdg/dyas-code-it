import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PracticeService } from '../../services/practice.service';
import { CodeService, type ExecuteResult } from '../../services/code.service';
import { diffLines, type DiffLine } from '../../core/diff';
import type { PracticeProject, ProjectVersion, ProjectVisibility } from '../../models/practice.model';

// Sandbox editor: edit code, run it, snapshot versions, view history/diffs,
// restore old versions, control visibility, and (for challenge projects)
// request hints / mark complete.
@Component({
  selector: 'app-project-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './project-editor.html',
})
export class ProjectEditor {
  readonly projectId = input.required<string>();

  private readonly practice = inject(PracticeService);
  private readonly codeService = inject(CodeService);

  readonly project = signal<PracticeProject | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);

  readonly source = signal('');
  readonly running = signal(false);
  readonly runResult = signal<ExecuteResult | null>(null);

  readonly saving = signal(false);
  versionMessage = '';

  // Version history panel state
  readonly selectedVersion = signal<ProjectVersion | null>(null);
  readonly diff = signal<DiffLine[] | null>(null);

  // Challenge extras
  readonly hint = signal<string | undefined>(undefined);
  readonly hintExhausted = signal(false);
  readonly completing = signal(false);

  readonly versions = computed(() => this.project()?.versions ?? []);
  readonly latestVersion = computed(() => this.versions()[0] ?? null);

  constructor() {
    effect(() => {
      void this.load(this.projectId());
    });
  }

  private async load(projectId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const project = await this.practice.getProject(projectId);
      this.project.set(project);
      this.source.set(project.versions?.[0]?.code ?? '');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load project.');
    } finally {
      this.loading.set(false);
    }
  }

  async run(): Promise<void> {
    const project = this.project();
    if (!project) return;
    this.running.set(true);
    this.runResult.set(null);
    this.error.set(undefined);
    try {
      this.runResult.set(await this.codeService.execute(project.language, this.source()));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to run code.');
    } finally {
      this.running.set(false);
    }
  }

  async saveVersion(): Promise<void> {
    const project = this.project();
    if (!project) return;
    this.saving.set(true);
    this.error.set(undefined);
    try {
      await this.practice.saveVersion(project.id, this.source(), this.versionMessage);
      this.versionMessage = '';
      await this.load(project.id);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to save version.');
    } finally {
      this.saving.set(false);
    }
  }

  viewVersion(version: ProjectVersion): void {
    if (this.selectedVersion()?.id === version.id) {
      this.selectedVersion.set(null);
      this.diff.set(null);
      return;
    }
    this.selectedVersion.set(version);
    // Diff against the current editor buffer so "what changed since then" is obvious.
    this.diff.set(diffLines(version.code, this.source()));
  }

  loadVersionIntoEditor(version: ProjectVersion): void {
    this.source.set(version.code);
    this.selectedVersion.set(null);
    this.diff.set(null);
  }

  async restore(version: ProjectVersion): Promise<void> {
    const project = this.project();
    if (!project) return;
    this.error.set(undefined);
    try {
      await this.practice.restoreVersion(project.id, version.id);
      await this.load(project.id);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to restore version.');
    }
  }

  async setVisibility(visibility: string): Promise<void> {
    const project = this.project();
    if (!project) return;
    this.error.set(undefined);
    try {
      const updated = await this.practice.updateProject(project.id, {
        visibility: visibility as ProjectVisibility,
      });
      this.project.update((p) => (p ? { ...p, visibility: updated.visibility } : p));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to update visibility.');
    }
  }

  async getHint(): Promise<void> {
    const challengeId = this.project()?.challengeId;
    if (!challengeId) return;
    this.error.set(undefined);
    try {
      const { hint } = await this.practice.requestHint(challengeId);
      this.hint.set(hint);
    } catch (err) {
      if (err instanceof Error && err.message.includes('No more hints')) {
        this.hintExhausted.set(true);
      } else {
        this.error.set(err instanceof Error ? err.message : 'Failed to get a hint.');
      }
    }
  }

  async markComplete(): Promise<void> {
    const challengeId = this.project()?.challengeId;
    if (!challengeId) return;
    this.completing.set(true);
    this.error.set(undefined);
    try {
      await this.practice.completeChallenge(challengeId);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to mark complete.');
    } finally {
      this.completing.set(false);
    }
  }
}
