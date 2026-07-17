// Shared domain types. These mirror the backend Sequelize models
// (apps/backend/src/models) — keep them in sync when a model changes.
// `null` (not optional `?`) is used for nullable columns to match the backend.

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TopicStatus = 'draft' | 'published' | 'archived';

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  adminId: string;
  status: TopicStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: string;
  topicId: string;
  teacherId: string;
  name: string;
  classCode: string;
  schedule: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeExample {
  language: string;
  code: string;
  description: string;
  expectedOutput: string;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  learningObjectives: string | null;
  position: number;
  codeExamples: CodeExample[];
  createdAt: Date;
  updatedAt: Date;
}

export type CertificateStatus = 'active' | 'revoked';

// Defined ahead of the Phase 1 backend Certificate model; the QR code encodes the
// public verification URL (derived from certificateCode) rather than being stored.
export interface Certificate {
  id: string;
  studentId: string;
  classId: string;
  topicId: string;
  certificateCode: string;
  verificationHash: string;
  issuedDate: Date;
  pdfUrl: string | null;
  status: CertificateStatus;
}
