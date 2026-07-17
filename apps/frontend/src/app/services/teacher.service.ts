import { Injectable } from '@angular/core';
import { apiFetch } from '../core/api';
import type {
  Topic,
  GradingQueueItem,
  TeacherSubmissionDetail,
  AssessmentSubmissionRecord,
  ManualGrade,
} from '../models/curriculum.model';
import type { ClassInfo, ClassProgress, ClassStudent, TeacherClass } from '../models/class.model';

export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status: 'active' | 'canceled' | 'past_due';
  freeClassLimit: number;
}

export interface SimilarityFlag {
  assessmentId: string;
  assessmentTitle: string;
  questionIndex: number;
  studentA: { id: string; name: string };
  studentB: { id: string; name: string };
  similarity: number;
}

export interface BehaviorFlag {
  assessmentId: string;
  assessmentTitle: string;
  student: { id: string; name: string };
  submissionId: string;
  flags: string[];
}

export interface IntegrityReport {
  similarityFlags: SimilarityFlag[];
  behaviorFlags: BehaviorFlag[];
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  async listPublishedTopics(): Promise<Topic[]> {
    const body = await apiFetch<{ topics: Topic[] }>('/teacher/topics');
    return body.topics;
  }

  async getSubscription(): Promise<SubscriptionInfo> {
    const body = await apiFetch<{ subscription: SubscriptionInfo }>('/teacher/subscription');
    return body.subscription;
  }

  async startUpgradeCheckout(): Promise<string> {
    const body = await apiFetch<{ url: string }>('/teacher/subscription/checkout', { method: 'POST' });
    return body.url;
  }

  async getIntegrityReport(classId: string): Promise<IntegrityReport> {
    return apiFetch(`/teacher/classes/${classId}/integrity`);
  }

  async createClass(input: { topicId: string; name: string; schedule?: string }): Promise<ClassInfo> {
    const body = await apiFetch<{ class: ClassInfo }>('/teacher/classes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.class;
  }

  async listClasses(): Promise<TeacherClass[]> {
    const body = await apiFetch<{ classes: TeacherClass[] }>('/teacher/classes');
    return body.classes;
  }

  async getClass(id: string): Promise<{
    class: ClassInfo;
    topic: Pick<Topic, 'id' | 'name' | 'description'>;
    students: ClassStudent[];
    maxStudents: number;
  }> {
    return apiFetch(`/teacher/classes/${id}`);
  }

  async getClassProgress(id: string): Promise<ClassProgress> {
    return apiFetch(`/teacher/classes/${id}/progress`);
  }

  async updateClass(
    id: string,
    patch: { name?: string; schedule?: string | null; active?: boolean },
  ): Promise<ClassInfo> {
    const body = await apiFetch<{ class: ClassInfo }>(`/teacher/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.class;
  }

  async getGradingQueue(classId: string): Promise<GradingQueueItem[]> {
    const body = await apiFetch<{ submissions: GradingQueueItem[] }>(`/teacher/classes/${classId}/grading-queue`);
    return body.submissions;
  }

  async getSubmission(submissionId: string): Promise<TeacherSubmissionDetail> {
    return apiFetch(`/teacher/submissions/${submissionId}`);
  }

  async gradeSubmission(submissionId: string, grades: ManualGrade[]): Promise<AssessmentSubmissionRecord> {
    const body = await apiFetch<{ submission: AssessmentSubmissionRecord }>(
      `/teacher/submissions/${submissionId}/grade`,
      { method: 'PATCH', body: JSON.stringify({ grades }) },
    );
    return body.submission;
  }
}
