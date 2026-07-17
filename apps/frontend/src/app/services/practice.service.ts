import { Injectable } from '@angular/core';
import { apiFetch } from '../core/api';
import type {
  CertificateEligibility,
  CertificateRecord,
  CertificateVerification,
  ChallengeProgress,
  CodingChallenge,
  PracticeProject,
  ProjectVersion,
  ProjectVisibility,
} from '../models/practice.model';

// Student-facing practice sandbox, guided challenges, and certificates, plus the
// teacher's shared-project views and the admin challenge editor — all the Phase 5
// API surface in one place.
@Injectable({ providedIn: 'root' })
export class PracticeService {
  // --- Student: projects ---

  async listProjects(): Promise<PracticeProject[]> {
    const body = await apiFetch<{ projects: PracticeProject[] }>('/student/projects');
    return body.projects;
  }

  async createProject(payload: { title: string; description: string; language: string }): Promise<PracticeProject> {
    const body = await apiFetch<{ project: PracticeProject }>('/student/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return body.project;
  }

  async getProject(projectId: string): Promise<PracticeProject> {
    const body = await apiFetch<{ project: PracticeProject }>(`/student/projects/${projectId}`);
    return body.project;
  }

  async updateProject(
    projectId: string,
    patch: { title?: string; description?: string; visibility?: ProjectVisibility },
  ): Promise<PracticeProject> {
    const body = await apiFetch<{ project: PracticeProject }>(`/student/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.project;
  }

  async deleteProject(projectId: string): Promise<void> {
    await apiFetch(`/student/projects/${projectId}`, { method: 'DELETE' });
  }

  async saveVersion(projectId: string, code: string, message: string): Promise<ProjectVersion> {
    const body = await apiFetch<{ version: ProjectVersion }>(`/student/projects/${projectId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ code, message }),
    });
    return body.version;
  }

  async restoreVersion(projectId: string, versionId: string): Promise<ProjectVersion> {
    const body = await apiFetch<{ version: ProjectVersion }>(
      `/student/projects/${projectId}/versions/${versionId}/restore`,
      { method: 'POST' },
    );
    return body.version;
  }

  // --- Student: challenges ---

  async listChallenges(): Promise<{ challenges: CodingChallenge[]; progress: ChallengeProgress[] }> {
    return apiFetch('/student/challenges');
  }

  async startChallenge(challengeId: string): Promise<{ projectId: string; progress: ChallengeProgress }> {
    return apiFetch(`/student/challenges/${challengeId}/start`, { method: 'POST' });
  }

  async requestHint(challengeId: string): Promise<{ hint: string; hintNumber: number; totalHints: number }> {
    return apiFetch(`/student/challenges/${challengeId}/hint`, { method: 'POST' });
  }

  async completeChallenge(challengeId: string): Promise<ChallengeProgress> {
    const body = await apiFetch<{ progress: ChallengeProgress }>(`/student/challenges/${challengeId}/complete`, {
      method: 'POST',
    });
    return body.progress;
  }

  // --- Student: certificates ---

  async getEligibility(classId: string): Promise<CertificateEligibility> {
    return apiFetch(`/student/classes/${classId}/certificate-eligibility`);
  }

  async claimCertificate(classId: string): Promise<CertificateRecord> {
    const body = await apiFetch<{ certificate: CertificateRecord }>(`/student/classes/${classId}/certificate`, {
      method: 'POST',
    });
    return body.certificate;
  }

  async listCertificates(): Promise<CertificateRecord[]> {
    const body = await apiFetch<{ certificates: CertificateRecord[] }>('/student/certificates');
    return body.certificates;
  }

  async getCertificate(id: string): Promise<{ certificate: CertificateRecord; verifyUrl: string; qrDataUrl: string }> {
    return apiFetch(`/student/certificates/${id}`);
  }

  // --- Public (no auth) ---

  async verifyCertificate(code: string): Promise<CertificateVerification> {
    return apiFetch(`/public/certificates/verify/${code}`);
  }

  // --- Teacher: shared projects ---

  async listSharedProjects(): Promise<PracticeProject[]> {
    const body = await apiFetch<{ projects: PracticeProject[] }>('/teacher/projects');
    return body.projects;
  }

  async getSharedProject(projectId: string): Promise<PracticeProject> {
    const body = await apiFetch<{ project: PracticeProject }>(`/teacher/projects/${projectId}`);
    return body.project;
  }

  async leaveFeedback(projectId: string, versionId: string, feedback: string): Promise<ProjectVersion> {
    const body = await apiFetch<{ version: ProjectVersion }>(
      `/teacher/projects/${projectId}/versions/${versionId}/feedback`,
      { method: 'PATCH', body: JSON.stringify({ feedback }) },
    );
    return body.version;
  }

  // --- Admin: challenge management ---

  async adminListChallenges(): Promise<CodingChallenge[]> {
    const body = await apiFetch<{ challenges: CodingChallenge[] }>('/admin/challenges');
    return body.challenges;
  }

  async adminCreateChallenge(payload: Partial<CodingChallenge>): Promise<CodingChallenge> {
    const body = await apiFetch<{ challenge: CodingChallenge }>('/admin/challenges', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return body.challenge;
  }

  async adminUpdateChallenge(id: string, patch: Partial<CodingChallenge>): Promise<CodingChallenge> {
    const body = await apiFetch<{ challenge: CodingChallenge }>(`/admin/challenges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return body.challenge;
  }

  async adminDeleteChallenge(id: string): Promise<void> {
    await apiFetch(`/admin/challenges/${id}`, { method: 'DELETE' });
  }
}
