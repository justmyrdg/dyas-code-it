import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DyasService, type DyasContextType, type DyasMessage } from '../services/dyas.service';

// Floating Dyas chat widget, shown to students on every authenticated page.
// Context (which lesson/assessment/project the student is on) is inferred from
// the current route so Dyas can tailor its guidance.
@Component({
  selector: 'app-dyas-widget',
  imports: [FormsModule],
  templateUrl: './dyas-widget.html',
})
export class DyasWidget {
  private readonly dyas = inject(DyasService);
  private readonly router = inject(Router);

  readonly open = signal(false);
  readonly messages = signal<DyasMessage[]>([]);
  readonly sending = signal(false);
  readonly error = signal<string | undefined>(undefined);
  private conversationId: string | undefined;

  draft = '';

  private currentContext(): { contextType: DyasContextType; contextId?: string } {
    const url = this.router.url;
    let match = url.match(/\/student\/classes\/[^/]+\/lessons\/([^/?#]+)/);
    if (match) return { contextType: 'lesson', contextId: match[1] };
    match = url.match(/\/student\/classes\/[^/]+\/assessments\/([^/?#]+)/);
    if (match) return { contextType: 'assessment', contextId: match[1] };
    match = url.match(/\/student\/practice\/([^/?#]+)/);
    if (match) return { contextType: 'sandbox', contextId: match[1] };
    return { contextType: 'general' };
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  async send(): Promise<void> {
    const message = this.draft.trim();
    if (!message || this.sending()) return;
    this.draft = '';
    this.error.set(undefined);
    this.messages.update((list) => [
      ...list,
      { role: 'student', content: message, timestamp: new Date().toISOString() },
    ]);
    this.sending.set(true);
    try {
      const { conversationId, reply } = await this.dyas.chat({
        message,
        conversationId: this.conversationId,
        ...this.currentContext(),
      });
      this.conversationId = conversationId;
      this.messages.update((list) => [...list, reply]);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Dyas is unavailable right now.');
    } finally {
      this.sending.set(false);
    }
  }

  newConversation(): void {
    this.conversationId = undefined;
    this.messages.set([]);
    this.error.set(undefined);
  }
}
