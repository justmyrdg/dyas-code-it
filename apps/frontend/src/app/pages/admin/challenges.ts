import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PracticeService } from '../../services/practice.service';
import type { ChallengeDifficulty, CodingChallenge } from '../../models/practice.model';

// Admin editor for guided coding challenges (title, difficulty, starter code,
// progressive hints, publish toggle).
@Component({
  selector: 'app-admin-challenges',
  imports: [FormsModule],
  templateUrl: './challenges.html',
})
export class ChallengesPage {
  private readonly practice = inject(PracticeService);

  readonly challenges = signal<CodingChallenge[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly saving = signal(false);

  // null = creating new; string = editing that id; undefined = form closed
  readonly editingId = signal<string | null | undefined>(undefined);
  title = '';
  description = '';
  difficulty: ChallengeDifficulty = 'beginner';
  language = 'python';
  starterCode = '';
  hintsText = '';

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      this.challenges.set(await this.practice.adminListChallenges());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load challenges.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    this.editingId.set(null);
    this.title = '';
    this.description = '';
    this.difficulty = 'beginner';
    this.language = 'python';
    this.starterCode = '';
    this.hintsText = '';
  }

  openEdit(challenge: CodingChallenge): void {
    this.editingId.set(challenge.id);
    this.title = challenge.title;
    this.description = challenge.description;
    this.difficulty = challenge.difficulty;
    this.language = challenge.language;
    this.starterCode = challenge.starterCode ?? '';
    this.hintsText = (challenge.hints ?? []).join('\n');
  }

  closeForm(): void {
    this.editingId.set(undefined);
  }

  async save(): Promise<void> {
    if (!this.title.trim()) return;
    this.saving.set(true);
    this.error.set(undefined);
    const payload = {
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      language: this.language,
      starterCode: this.starterCode,
      // One hint per line, blank lines dropped.
      hints: this.hintsText.split('\n').map((h) => h.trim()).filter(Boolean),
    };
    try {
      const id = this.editingId();
      if (id) {
        await this.practice.adminUpdateChallenge(id, payload);
      } else {
        await this.practice.adminCreateChallenge(payload);
      }
      this.closeForm();
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to save challenge.');
    } finally {
      this.saving.set(false);
    }
  }

  async togglePublish(challenge: CodingChallenge): Promise<void> {
    this.error.set(undefined);
    try {
      await this.practice.adminUpdateChallenge(challenge.id, { published: !challenge.published });
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to update challenge.');
    }
  }

  async remove(challenge: CodingChallenge): Promise<void> {
    this.error.set(undefined);
    try {
      await this.practice.adminDeleteChallenge(challenge.id);
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete challenge.');
    }
  }
}
