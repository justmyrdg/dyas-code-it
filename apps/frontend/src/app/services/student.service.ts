import { Injectable } from '@angular/core';
import { apiFetch } from '../core/api';
import type {
  Lesson,
  StudentActivity,
  ActivitySubmissionRecord,
  GradeResult,
  StudentAssessment,
  AssessmentSubmissionRecord,
} from '../models/curriculum.model';
import type { ClassCurriculum, ClassInfo, EnrolledClass, LessonProgress } from '../models/class.model';

export interface LessonPayload {
  lesson: Lesson;
  progress: LessonProgress;
  activities: StudentActivity[];
  submissions: ActivitySubmissionRecord[];
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  async joinClass(code: string): Promise<ClassInfo> {
    const body = await apiFetch<{ class: ClassInfo }>('/student/enrollments', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return body.class;
  }

  async listMyClasses(): Promise<EnrolledClass[]> {
    const body = await apiFetch<{ classes: EnrolledClass[] }>('/student/classes');
    return body.classes;
  }

  async getClassCurriculum(classId: string): Promise<ClassCurriculum> {
    return apiFetch(`/student/classes/${classId}`);
  }

  async getLesson(classId: string, lessonId: string): Promise<LessonPayload> {
    return apiFetch(`/student/classes/${classId}/lessons/${lessonId}`);
  }

  async submitActivity(
    classId: string,
    activityId: string,
    answer: unknown,
  ): Promise<{ submission: ActivitySubmissionRecord; result: GradeResult }> {
    return apiFetch(`/student/classes/${classId}/activities/${activityId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  async getAssessment(
    classId: string,
    assessmentId: string,
  ): Promise<{ assessment: StudentAssessment; submissions: AssessmentSubmissionRecord[] }> {
    return apiFetch(`/student/classes/${classId}/assessments/${assessmentId}`);
  }

  async submitAssessment(
    classId: string,
    assessmentId: string,
    answers: unknown[],
    integrity?: { tabSwitches: number; pastedChars: number; timeSpentSeconds: number },
  ): Promise<{ submission: AssessmentSubmissionRecord }> {
    return apiFetch(`/student/classes/${classId}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, integrity }),
    });
  }

  async completeLesson(classId: string, lessonId: string): Promise<LessonProgress> {
    const body = await apiFetch<{ progress: LessonProgress }>(
      `/student/classes/${classId}/lessons/${lessonId}/complete`,
      { method: 'POST' },
    );
    return body.progress;
  }
}
