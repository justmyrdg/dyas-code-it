import { Injectable } from '@angular/core';
import { apiFetch } from '../core/api';

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

export interface LanguageInfo {
  id: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class CodeService {
  async listLanguages(): Promise<LanguageInfo[]> {
    const body = await apiFetch<{ languages: LanguageInfo[] }>('/code/languages');
    return body.languages;
  }

  async execute(language: string, source: string, stdin?: string): Promise<ExecuteResult> {
    const body = await apiFetch<{ result: ExecuteResult }>('/code/execute', {
      method: 'POST',
      body: JSON.stringify({ language, source, stdin }),
    });
    return body.result;
  }
}
