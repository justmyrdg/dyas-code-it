import { type CodeExecutor } from './code-execution.service';
export type ActivityType = 'quiz' | 'code_challenge' | 'fill_blank' | 'debug';
export interface QuizConfig {
    options: string[];
    correctIndex: number;
}
export interface FillBlankConfig {
    answers: string[];
}
export interface CodeTestCase {
    stdin: string;
    expectedStdout: string;
}
export interface CodeChallengeConfig {
    language: string;
    starterCode?: string;
    testCases: CodeTestCase[];
}
export type ActivityConfig = QuizConfig | FillBlankConfig | CodeChallengeConfig;
export interface QuizAnswer {
    selectedIndex: number;
}
export interface FillBlankAnswer {
    values: string[];
}
export interface CodeAnswer {
    source: string;
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
export declare function gradeQuiz(config: QuizConfig, answer: QuizAnswer): GradeResult;
export declare function gradeFillBlank(config: FillBlankConfig, answer: FillBlankAnswer): GradeResult;
export declare function gradeCodeChallenge(config: CodeChallengeConfig, answer: CodeAnswer, executor?: CodeExecutor): Promise<GradeResult>;
export type QuestionType = 'mcq' | 'code' | 'short_answer';
export interface AssessmentQuestion {
    type: QuestionType;
    prompt: string;
    points: number;
    config: Record<string, unknown>;
}
export interface QuestionFeedback {
    score: number;
    maxPoints: number;
    autoGraded: boolean;
    comment: string;
    details?: TestCaseResult[];
}
export interface AssessmentAutoGrade {
    feedback: QuestionFeedback[];
    autoScore: number;
    maxScore: number;
    needsManualReview: boolean;
}
export declare function gradeAssessmentAuto(questions: AssessmentQuestion[], answers: unknown[], executor?: CodeExecutor): Promise<AssessmentAutoGrade>;
export declare function gradeActivity(type: ActivityType, config: ActivityConfig, answer: unknown, executor?: CodeExecutor): Promise<GradeResult>;
//# sourceMappingURL=grading.service.d.ts.map