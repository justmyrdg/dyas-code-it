import type { Chapter, Topic } from './curriculum.model';

export interface ClassInfo {
  id: string;
  topicId: string;
  teacherId: string;
  name: string;
  classCode: string;
  schedule: string | null;
  active: boolean;
  createdAt: string;
}

export interface TeacherClass extends ClassInfo {
  topic?: Pick<Topic, 'id' | 'name'>;
  enrolledCount: number;
  maxStudents: number;
}

export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface StudentProgressSummary {
  id: string;
  name: string;
  email: string;
  completedLessons: number;
  totalLessons: number;
}

export interface ClassProgress {
  totalLessons: number;
  students: StudentProgressSummary[];
  lessonCompletion: { lessonId: string; completedCount: number; enrolledCount: number }[];
}

export interface EnrolledClass extends ClassInfo {
  topic: Pick<Topic, 'id' | 'name' | 'description'>;
  teacher: { id: string; name: string };
  totalLessons: number;
  completedLessons: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface ClassCurriculum {
  class: ClassInfo;
  topic: Pick<Topic, 'id' | 'name' | 'description'>;
  chapters: Chapter[];
  progress: LessonProgress[];
}
