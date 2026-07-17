import { Injectable } from '@angular/core';
import { apiFetch } from '../core/api';

export type DyasContextType = 'lesson' | 'activity' | 'assessment' | 'sandbox' | 'general';

export interface DyasMessage {
  role: 'student' | 'dyas';
  content: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class DyasService {
  async chat(payload: {
    message: string;
    conversationId?: string;
    contextType?: DyasContextType;
    contextId?: string;
  }): Promise<{ conversationId: string; reply: DyasMessage }> {
    return apiFetch('/student/dyas/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
