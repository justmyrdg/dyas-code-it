import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PracticeService } from '../../services/practice.service';
import type {
  CertificateRecord,
  ChallengeProgress,
  CodingChallenge,
  PracticeProject,
} from '../../models/practice.model';

type PracticeTab = 'projects' | 'challenges' | 'certificates';

// Practice hub: the student's sandbox projects, guided challenges, and earned
// certificates in one place.
@Component({
  selector: 'app-student-practice',
  imports: [FormsModule, RouterLink],
  templateUrl: './practice.html',
})
export class PracticePage {
  private readonly practice = inject(PracticeService);
  private readonly router = inject(Router);

  readonly tab = signal<PracticeTab>('projects');
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);

  readonly projects = signal<PracticeProject[]>([]);
  readonly challenges = signal<CodingChallenge[]>([]);
  readonly progress = signal<ChallengeProgress[]>([]);
  readonly certificates = signal<CertificateRecord[]>([]);

  // New-project form
  readonly showCreate = signal(false);
  readonly creating = signal(false);
  newTitle = '';
  newDescription = '';
  newLanguage = 'python';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const [projects, challengeData, certificates] = await Promise.all([
        this.practice.listProjects(),
        this.practice.listChallenges(),
        this.practice.listCertificates(),
      ]);
      this.projects.set(projects);
      this.challenges.set(challengeData.challenges);
      this.progress.set(challengeData.progress);
      this.certificates.set(certificates);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load practice data.');
    } finally {
      this.loading.set(false);
    }
  }

  progressFor(challengeId: string): ChallengeProgress | undefined {
    return this.progress().find((p) => p.challengeId === challengeId);
  }

  async createProject(): Promise<void> {
    if (!this.newTitle.trim()) return;
    this.creating.set(true);
    this.error.set(undefined);
    try {
      const project = await this.practice.createProject({
        title: this.newTitle,
        description: this.newDescription,
        language: this.newLanguage,
      });
      await this.router.navigate(['/student/practice', project.id]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to create project.');
      this.creating.set(false);
    }
  }

  async startChallenge(challengeId: string): Promise<void> {
    this.error.set(undefined);
    try {
      const { projectId } = await this.practice.startChallenge(challengeId);
      await this.router.navigate(['/student/practice', projectId]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to start challenge.');
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    this.error.set(undefined);
    try {
      await this.practice.deleteProject(projectId);
      this.projects.update((list) => list.filter((p) => p.id !== projectId));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete project.');
    }
  }
}
