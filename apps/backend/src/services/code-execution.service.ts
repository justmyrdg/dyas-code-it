import axios from 'axios';
import {
  CODE_EXECUTION_TIMEOUT_MS,
  CODE_EXECUTION_MAX_SOURCE_BYTES,
} from '../config/limits';

// Interactive code execution for lessons, activities, and (later) the practice sandbox.
// We call a hosted Piston instance over HTTP rather than running a sandbox ourselves,
// which keeps the no-Docker constraint intact. Everything goes through the CodeExecutor
// interface so a Judge0 adapter can be dropped in later without touching callers.

export interface ExecuteRequest {
  language: string; // internal id — one of SUPPORTED_LANGUAGES below
  source: string;
  stdin?: string;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
}

export interface LanguageInfo {
  id: string; // internal id
  label: string; // human-facing name
}

export interface CodeExecutor {
  listLanguages(): Promise<LanguageInfo[]>;
  execute(req: ExecuteRequest): Promise<ExecuteResult>;
}

// Thrown for caller-facing failures (bad language, executor down). Carries an HTTP-ish
// status + machine code so the controller can forward it via sendError().
export class ExecutionError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ExecutionError';
  }
}

// Internal language id -> how Piston refers to it + the filename it expects. Keep these
// ids in sync with the frontend highlighter (core/code-block.ts): python/cpp/javascript/java.
const LANGUAGE_MAP: Record<string, { piston: string; filename: string; label: string }> = {
  python: { piston: 'python', filename: 'main.py', label: 'Python' },
  javascript: { piston: 'javascript', filename: 'main.js', label: 'JavaScript' },
  cpp: { piston: 'c++', filename: 'main.cpp', label: 'C++' },
  java: { piston: 'java', filename: 'Main.java', label: 'Java' },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_MAP);

interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

// Compares dotted version strings numerically (e.g. "3.10.0" > "3.9.4"). Returns >0 / 0 / <0.
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

class PistonExecutor implements CodeExecutor {
  private readonly baseUrl =
    process.env.PISTON_URL?.replace(/\/$/, '') || 'https://emkc.org/api/v2/piston';

  // Piston's /execute requires an exact runtime version. Rather than hardcode versions
  // that drift on the public instance, resolve the highest available version per language
  // once and cache it for the process lifetime.
  private runtimeCache: Map<string, string> | null = null;

  private async resolveVersions(): Promise<Map<string, string>> {
    if (this.runtimeCache) return this.runtimeCache;
    let runtimes: PistonRuntime[];
    try {
      const { data } = await axios.get<PistonRuntime[]>(`${this.baseUrl}/runtimes`, {
        timeout: 10000,
      });
      runtimes = data;
    } catch {
      throw new ExecutionError(502, 'executor_unavailable', 'Code execution service is unavailable.');
    }
    const map = new Map<string, string>();
    for (const rt of runtimes) {
      for (const key of [rt.language, ...(rt.aliases ?? [])]) {
        const existing = map.get(key);
        if (!existing || compareVersions(rt.version, existing) > 0) {
          map.set(key, rt.version);
        }
      }
    }
    this.runtimeCache = map;
    return map;
  }

  async listLanguages(): Promise<LanguageInfo[]> {
    const versions = await this.resolveVersions();
    return SUPPORTED_LANGUAGES.filter((id) => versions.has(LANGUAGE_MAP[id].piston)).map((id) => ({
      id,
      label: LANGUAGE_MAP[id].label,
    }));
  }

  async execute({ language, source, stdin }: ExecuteRequest): Promise<ExecuteResult> {
    const lang = LANGUAGE_MAP[language];
    if (!lang) {
      throw new ExecutionError(400, 'unsupported_language', `Language '${language}' is not supported.`);
    }
    if (Buffer.byteLength(source, 'utf8') > CODE_EXECUTION_MAX_SOURCE_BYTES) {
      throw new ExecutionError(413, 'source_too_large', 'Source code exceeds the size limit.');
    }

    const versions = await this.resolveVersions();
    const version = versions.get(lang.piston);
    if (!version) {
      throw new ExecutionError(502, 'language_unavailable', `Runtime for '${language}' is unavailable.`);
    }

    let data: any;
    try {
      const response = await axios.post(
        `${this.baseUrl}/execute`,
        {
          language: lang.piston,
          version,
          files: [{ name: lang.filename, content: source }],
          stdin: stdin ?? '',
          run_timeout: CODE_EXECUTION_TIMEOUT_MS,
          compile_timeout: 10000,
        },
        { timeout: CODE_EXECUTION_TIMEOUT_MS + 15000 },
      );
      data = response.data;
    } catch {
      throw new ExecutionError(502, 'executor_unavailable', 'Code execution service is unavailable.');
    }

    const compile = data.compile;
    const run = data.run;

    // A failed compile step means the program never ran — surface the compiler diagnostics.
    if (compile && compile.code !== 0 && (compile.stderr || compile.output)) {
      return {
        stdout: run?.stdout ?? '',
        stderr: compile.stderr || compile.output || '',
        exitCode: compile.code,
        timedOut: false,
      };
    }

    // Piston kills a run that exceeds run_timeout with SIGKILL.
    const timedOut = (run?.signal ?? null) === 'SIGKILL';
    return {
      stdout: run?.stdout ?? '',
      stderr: run?.stderr ?? '',
      exitCode: run?.code ?? null,
      timedOut,
    };
  }
}

// Shared singleton — reused by the code controller and (Phase A2) the grading service.
export const codeExecutor: CodeExecutor = new PistonExecutor();
