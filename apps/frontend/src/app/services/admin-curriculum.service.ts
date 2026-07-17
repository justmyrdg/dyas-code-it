import { Injectable } from '@angular/core';
import { apiFetch } from '../core/api';
import type {
  ActivityType,
  AssessmentQuestion,
  Chapter,
  ChapterAssessment,
  CodeExample,
  Lesson,
  MiniActivity,
  Topic,
  TopicStatus,
  TopicTree,
} from '../models/curriculum.model';

@Injectable({ providedIn: 'root' })
export class AdminCurriculumService {
  async listTopics(): Promise<Topic[]> {
    const body = await apiFetch<{ topics: Topic[] }>('/admin/topics');
    return body.topics;
  }

  async getTopic(id: string): Promise<TopicTree> {
    const body = await apiFetch<{ topic: TopicTree }>(`/admin/topics/${id}`);
    return body.topic;
  }

  async createTopic(input: { name: string; description?: string }): Promise<Topic> {
    const body = await apiFetch<{ topic: Topic }>('/admin/topics', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.topic;
  }

  async updateTopic(
    id: string,
    patch: { name?: string; description?: string | null; status?: TopicStatus },
  ): Promise<Topic> {
    const body = await apiFetch<{ topic: Topic }>(`/admin/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.topic;
  }

  async deleteTopic(id: string): Promise<void> {
    await apiFetch(`/admin/topics/${id}`, { method: 'DELETE' });
  }

  async createChapter(topicId: string, input: { title: string; description?: string }): Promise<Chapter> {
    const body = await apiFetch<{ chapter: Chapter }>(`/admin/topics/${topicId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.chapter;
  }

  async updateChapter(
    id: string,
    patch: { title?: string; description?: string | null; position?: number },
  ): Promise<Chapter> {
    const body = await apiFetch<{ chapter: Chapter }>(`/admin/chapters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.chapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await apiFetch(`/admin/chapters/${id}`, { method: 'DELETE' });
  }

  async createLesson(
    chapterId: string,
    input: { title: string; content: string; learningObjectives?: string; codeExamples?: CodeExample[] },
  ): Promise<Lesson> {
    const body = await apiFetch<{ lesson: Lesson }>(`/admin/chapters/${chapterId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.lesson;
  }

  async updateLesson(
    id: string,
    patch: {
      title?: string;
      content?: string;
      learningObjectives?: string | null;
      position?: number;
      codeExamples?: CodeExample[];
    },
  ): Promise<Lesson> {
    const body = await apiFetch<{ lesson: Lesson }>(`/admin/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.lesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await apiFetch(`/admin/lessons/${id}`, { method: 'DELETE' });
  }

  async createActivity(
    lessonId: string,
    input: { type: ActivityType; prompt: string; config: Record<string, unknown> },
  ): Promise<MiniActivity> {
    const body = await apiFetch<{ activity: MiniActivity }>(`/admin/lessons/${lessonId}/activities`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.activity;
  }

  async updateActivity(
    id: string,
    patch: { prompt?: string; position?: number; config?: Record<string, unknown> },
  ): Promise<MiniActivity> {
    const body = await apiFetch<{ activity: MiniActivity }>(`/admin/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.activity;
  }

  async deleteActivity(id: string): Promise<void> {
    await apiFetch(`/admin/activities/${id}`, { method: 'DELETE' });
  }

  async createAssessment(
    chapterId: string,
    input: { title: string; passingScore?: number; retryCooldownHours?: number; questions: AssessmentQuestion[] },
  ): Promise<ChapterAssessment> {
    const body = await apiFetch<{ assessment: ChapterAssessment }>(`/admin/chapters/${chapterId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.assessment;
  }

  async updateAssessment(
    id: string,
    patch: { title?: string; passingScore?: number; retryCooldownHours?: number; questions?: AssessmentQuestion[] },
  ): Promise<ChapterAssessment> {
    const body = await apiFetch<{ assessment: ChapterAssessment }>(`/admin/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.assessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await apiFetch(`/admin/assessments/${id}`, { method: 'DELETE' });
  }
}
