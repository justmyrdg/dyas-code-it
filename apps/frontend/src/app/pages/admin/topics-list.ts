import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminCurriculumService } from '../../services/admin-curriculum.service';
import type { Topic } from '../../models/curriculum.model';

@Component({
  selector: 'app-admin-topics-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './topics-list.html',
})
export class TopicsList {
  private readonly curriculum = inject(AdminCurriculumService);

  readonly topics = signal<Topic[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly creating = signal(false);
  readonly showCreateForm = signal(false);

  newName = '';
  newDescription = '';

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      this.topics.set(await this.curriculum.listTopics());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load topics.');
    } finally {
      this.loading.set(false);
    }
  }

  async createTopic(): Promise<void> {
    if (!this.newName.trim()) return;
    this.creating.set(true);
    this.error.set(undefined);
    try {
      await this.curriculum.createTopic({
        name: this.newName,
        description: this.newDescription || undefined,
      });
      this.newName = '';
      this.newDescription = '';
      this.showCreateForm.set(false);
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to create topic.');
    } finally {
      this.creating.set(false);
    }
  }

  async deleteTopic(topic: Topic): Promise<void> {
    this.error.set(undefined);
    try {
      await this.curriculum.deleteTopic(topic.id);
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete topic.');
    }
  }

  statusCardClass(status: Topic['status']): string {
    switch (status) {
      case 'published':
        return 'uno-card-green';
      case 'archived':
        return 'uno-card-black';
      default:
        return 'uno-card-yellow';
    }
  }
}
