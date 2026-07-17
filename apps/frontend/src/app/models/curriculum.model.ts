export type TopicStatus = 'draft' | 'published' | 'archived';

export interface CodeExample {
  language: string;
  code: string;
  description: string;
  expectedOutput: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  adminId: string;
  status: TopicStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  learningObjectives: string | null;
  position: number;
  codeExamples: CodeExample[];
  activities?: MiniActivity[];
}

export interface Chapter {
  id: string;
  topicId: string;
  title: string;
  description: string | null;
  position: number;
  lessons?: Lesson[];
  assessments?: ChapterAssessment[];
}

export interface TopicTree extends Topic {
  chapters: Chapter[];
}

export type ActivityType = 'quiz' | 'code_challenge' | 'fill_blank' | 'debug';

// Full activity as authored by an admin (includes answer keys). Used by the admin editor.
export interface MiniActivity {
  id: string;
  lessonId: string;
  type: ActivityType;
  prompt: string;
  position: number;
  config: Record<string, unknown>;
}

// Answer-stripped activity served to students.
export interface StudentActivity {
  id: string;
  type: ActivityType;
  prompt: string;
  position: number;
  config: {
    options?: string[]; // quiz
    blankCount?: number; // fill_blank
    language?: string; // code_challenge / debug
    starterCode?: string; // code_challenge / debug
    sampleInputs?: string[]; // code_challenge / debug
  };
}

export interface TestCaseResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  expected: string;
}

export interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string;
  details?: TestCaseResult[];
}

export interface ActivitySubmissionRecord {
  id: string;
  activityId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  feedback: string | null;
  createdAt: string;
}

// --- Chapter assessments ---

export type QuestionType = 'mcq' | 'code' | 'short_answer';

export interface AssessmentQuestion {
  type: QuestionType;
  prompt: string;
  points: number;
  config: Record<string, unknown>;
}

// Full assessment (admin authoring); `questions` present only in admin payloads.
export interface ChapterAssessment {
  id: string;
  chapterId?: string;
  title: string;
  passingScore?: number;
  retryCooldownHours?: number;
  questions?: AssessmentQuestion[];
}

// Answer-stripped assessment served to students.
export interface StudentAssessment {
  id: string;
  title: string;
  passingScore: number;
  retryCooldownHours: number;
  questions: AssessmentQuestion[];
}

export interface QuestionFeedback {
  score: number;
  maxPoints: number;
  autoGraded: boolean;
  comment: string;
  details?: TestCaseResult[];
}

export type AssessmentStatus = 'pending' | 'auto_graded' | 'graded' | 'passed' | 'failed';

export interface AssessmentSubmissionRecord {
  id: string;
  studentId: string;
  assessmentId: string;
  classId: string;
  attemptNumber: number;
  answers: unknown[];
  autoScore: number;
  manualScore: number;
  totalScore: number;
  maxScore: number;
  status: AssessmentStatus;
  feedback: QuestionFeedback[];
  submittedAt: string;
  gradedAt: string | null;
  gradedBy: string | null;
}

export interface UserRef {
  id: string;
  name: string;
  email: string;
}

// A pending submission in a teacher's grading queue.
export interface GradingQueueItem extends AssessmentSubmissionRecord {
  student?: UserRef;
  assessment?: { id: string; title: string };
}

// Full submission detail a teacher grades against (questions include answer keys).
export interface TeacherSubmissionDetail {
  submission: AssessmentSubmissionRecord;
  assessment: ChapterAssessment;
  student: UserRef;
}

export interface ManualGrade {
  index: number;
  score: number;
  comment?: string;
}
