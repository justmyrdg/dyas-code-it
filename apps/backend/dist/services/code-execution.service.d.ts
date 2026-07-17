export interface ExecuteRequest {
    language: string;
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
    id: string;
    label: string;
}
export interface CodeExecutor {
    listLanguages(): Promise<LanguageInfo[]>;
    execute(req: ExecuteRequest): Promise<ExecuteResult>;
}
export declare class ExecutionError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(status: number, code: string, message: string);
}
export declare const SUPPORTED_LANGUAGES: string[];
export declare const codeExecutor: CodeExecutor;
//# sourceMappingURL=code-execution.service.d.ts.map