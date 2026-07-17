export type ProjectVisibility = 'private' | 'shared_with_teacher' | 'public';
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  code: string;
  message: string;
  teacherFeedback: string | null;
  createdAt: string;
}

export interface PracticeProject {
  id: string;
  studentId: string;
  title: string;
  description: string;
  language: string;
  visibility: ProjectVisibility;
  challengeId: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: ProjectVersion[];
  student?: { id: string; name: string; email?: string };
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  language: string;
  starterCode?: string;
  hints?: string[];
  published?: boolean;
  createdAt?: string;
}

export interface ChallengeProgress {
  id: string;
  challengeId: string;
  projectId: string;
  completed: boolean;
  viewedHints: number[];
}

export interface CertificateRecord {
  id: string;
  certificateCode: string;
  status: 'active' | 'revoked';
  issuedAt: string;
  topic?: { id: string; name: string };
  class?: { id: string; name: string; teacher?: { id: string; name: string } };
  student?: { id: string; name: string };
}

export interface CertificateEligibility {
  eligible: boolean;
  totalLessons: number;
  completedLessons: number;
  totalAssessments: number;
  passedAssessments: number;
  certificateId: string | null;
}

export interface CertificateVerification {
  valid: boolean;
  status: 'active' | 'revoked';
  studentName?: string;
  topicName?: string;
  className?: string;
  teacherName?: string;
  issuedAt: string;
}
