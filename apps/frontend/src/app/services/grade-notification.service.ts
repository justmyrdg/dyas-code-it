import { Injectable, inject, signal } from '@angular/core';
import { SocketService } from '../core/socket.service';

export interface GradeNotification {
  submissionId: string;
  assessmentId: string;
  classId: string;
  assessmentTitle: string;
  status: 'passed' | 'failed' | 'graded';
  totalScore: number;
  maxScore: number;
}

// Listens on the /projects namespace for `submission:graded` events targeting
// this user and exposes them as a signal the shell renders as toasts. Students
// only — the shell gates start() by role.
@Injectable({ providedIn: 'root' })
export class GradeNotificationService {
  private readonly socketService = inject(SocketService);
  private started = false;

  readonly notifications = signal<GradeNotification[]>([]);

  start(): void {
    if (this.started) return;
    this.started = true;
    const socket = this.socketService.connect('/projects');
    socket.on('submission:graded', (payload: GradeNotification) => {
      this.notifications.update((list) => [...list, payload]);
    });
  }

  dismiss(submissionId: string): void {
    this.notifications.update((list) => list.filter((n) => n.submissionId !== submissionId));
  }
}
