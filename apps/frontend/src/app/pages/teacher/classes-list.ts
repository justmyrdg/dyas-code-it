import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TeacherService, type SubscriptionInfo } from '../../services/teacher.service';
import { ApiError } from '../../core/api';
import type { Topic } from '../../models/curriculum.model';
import type { TeacherClass } from '../../models/class.model';

@Component({
  selector: 'app-teacher-classes-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './classes-list.html',
})
export class ClassesList {
  private readonly teacher = inject(TeacherService);

  readonly classes = signal<TeacherClass[]>([]);
  readonly topics = signal<Topic[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | undefined>(undefined);
  readonly limitReached = signal(false);
  readonly creating = signal(false);
  readonly showCreateForm = signal(false);
  readonly copiedCode = signal<string | null>(null);
  readonly subscription = signal<SubscriptionInfo | null>(null);
  readonly upgrading = signal(false);

  newTopicId = '';
  newName = '';
  newSchedule = '';

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(undefined);
    try {
      const [classes, topics] = await Promise.all([
        this.teacher.listClasses(),
        this.teacher.listPublishedTopics(),
      ]);
      this.classes.set(classes);
      this.topics.set(topics);
      // Non-critical — don't block the page if the subscription lookup fails.
      this.teacher
        .getSubscription()
        .then((s) => this.subscription.set(s))
        .catch(() => this.subscription.set(null));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load classes.');
    } finally {
      this.loading.set(false);
    }
  }

  async createClass(): Promise<void> {
    if (!this.newTopicId || !this.newName.trim()) return;
    this.creating.set(true);
    this.error.set(undefined);
    try {
      await this.teacher.createClass({
        topicId: this.newTopicId,
        name: this.newName,
        schedule: this.newSchedule || undefined,
      });
      this.newTopicId = '';
      this.newName = '';
      this.newSchedule = '';
      this.showCreateForm.set(false);
      await this.load();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'class_limit_reached') {
        this.limitReached.set(true);
        this.showCreateForm.set(false);
      }
      this.error.set(err instanceof Error ? err.message : 'Failed to create class.');
    } finally {
      this.creating.set(false);
    }
  }

  async upgrade(): Promise<void> {
    this.upgrading.set(true);
    this.error.set(undefined);
    try {
      const url = await this.teacher.startUpgradeCheckout();
      window.location.href = url;
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to start checkout.');
      this.upgrading.set(false);
    }
  }

  async copyCode(code: string): Promise<void> {
    await navigator.clipboard.writeText(code);
    this.copiedCode.set(code);
    setTimeout(() => this.copiedCode.set(null), 2000);
  }
}
