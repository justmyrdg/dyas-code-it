import { codeExecutor, type CodeExecutor } from './code-execution.service';

// Auto-grading for mini-activities. Quiz and fill-in-the-blank are graded in-process;
// code challenges (and debug tasks) run the student's source against test cases through the
// code executor. Kept free of Express/Sequelize so it can be unit-tested in isolation — the
// executor is injected (defaulting to the shared singleton) so tests pass a fake.

export type ActivityType = 'quiz' | 'code_challenge' | 'fill_blank' | 'debug';

export interface QuizConfig {
  options: string[];
  correctIndex: number;
}
export interface FillBlankConfig {
  answers: string[]; // one expected answer per blank, in order
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
  score: number; // 0..100
  passed: boolean;
  feedback: string;
  details?: TestCaseResult[];
}

// Normalizes program/expected output for comparison: trailing whitespace and CRLF differences
// shouldn't fail an otherwise-correct answer.
function normalizeOutput(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '');
}

export function gradeQuiz(config: QuizConfig, answer: QuizAnswer): GradeResult {
  const passed = answer.selectedIndex === config.correctIndex;
  return {
    score: passed ? 100 : 0,
    passed,
    feedback: passed ? 'Correct!' : 'Not quite — review the lesson and try again.',
  };
}

export function gradeFillBlank(config: FillBlankConfig, answer: FillBlankAnswer): GradeResult {
  const total = config.answers.length;
  if (total === 0) return { score: 100, passed: true, feedback: 'Nothing to grade.' };

  let correct = 0;
  for (let i = 0; i < total; i++) {
    const expected = (config.answers[i] ?? '').trim().toLowerCase();
    const given = (answer.values[i] ?? '').trim().toLowerCase();
    if (expected === given) correct++;
  }
  const score = Math.round((correct / total) * 100);
  const passed = correct === total;
  return {
    score,
    passed,
    feedback: passed
      ? 'All blanks correct!'
      : `You got ${correct} of ${total} blanks right.`,
  };
}

export async function gradeCodeChallenge(
  config: CodeChallengeConfig,
  answer: CodeAnswer,
  executor: CodeExecutor = codeExecutor,
): Promise<GradeResult> {
  const cases = config.testCases ?? [];
  if (cases.length === 0) {
    return { score: 100, passed: true, feedback: 'No test cases configured.' };
  }

  const details: TestCaseResult[] = [];
  let passedCount = 0;

  for (const testCase of cases) {
    const run = await executor.execute({
      language: config.language,
      source: answer.source,
      stdin: testCase.stdin,
    });
    const passed =
      !run.timedOut && normalizeOutput(run.stdout) === normalizeOutput(testCase.expectedStdout);
    if (passed) passedCount++;
    details.push({
      passed,
      stdout: run.stdout,
      stderr: run.timedOut ? 'Execution timed out.' : run.stderr,
      expected: testCase.expectedStdout,
    });
  }

  const score = Math.round((passedCount / cases.length) * 100);
  const passed = passedCount === cases.length;
  return {
    score,
    passed,
    feedback: passed
      ? 'All test cases passed!'
      : `Passed ${passedCount} of ${cases.length} test cases.`,
    details,
  };
}

// --- Chapter assessments ---

export type QuestionType = 'mcq' | 'code' | 'short_answer';

export interface AssessmentQuestion {
  type: QuestionType;
  prompt: string;
  points: number;
  // mcq: { options, correctIndex }; code: { language, testCases }; short_answer: {}
  config: Record<string, unknown>;
}

export interface QuestionFeedback {
  score: number; // points awarded for this question
  maxPoints: number;
  autoGraded: boolean; // false for short_answer until a teacher scores it
  comment: string;
  details?: TestCaseResult[];
}

export interface AssessmentAutoGrade {
  feedback: QuestionFeedback[];
  autoScore: number; // points from auto-graded questions
  maxScore: number; // total possible points across all questions
  needsManualReview: boolean; // true when any short_answer question is present
}

// Auto-grades the objective (mcq) and code questions of an assessment. Short-answer questions
// are recorded with 0 points and autoGraded=false so a teacher can score them later.
export async function gradeAssessmentAuto(
  questions: AssessmentQuestion[],
  answers: unknown[],
  executor: CodeExecutor = codeExecutor,
): Promise<AssessmentAutoGrade> {
  const feedback: QuestionFeedback[] = [];
  let autoScore = 0;
  let maxScore = 0;
  let needsManualReview = false;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const answer = answers[i];
    maxScore += question.points;

    if (question.type === 'mcq') {
      const cfg = question.config as unknown as QuizConfig;
      const selected = (answer as QuizAnswer | undefined)?.selectedIndex;
      const correct = selected === cfg.correctIndex;
      const score = correct ? question.points : 0;
      autoScore += score;
      feedback.push({
        score,
        maxPoints: question.points,
        autoGraded: true,
        comment: correct ? 'Correct.' : 'Incorrect.',
      });
    } else if (question.type === 'code') {
      const cfg = question.config as unknown as CodeChallengeConfig;
      const result = await gradeCodeChallenge(cfg, (answer as CodeAnswer) ?? { source: '' }, executor);
      const score = Math.round((result.score / 100) * question.points);
      autoScore += score;
      feedback.push({
        score,
        maxPoints: question.points,
        autoGraded: true,
        comment: result.feedback,
        details: result.details,
      });
    } else {
      // short_answer — awaits manual grading.
      needsManualReview = true;
      feedback.push({
        score: 0,
        maxPoints: question.points,
        autoGraded: false,
        comment: 'Awaiting teacher review.',
      });
    }
  }

  return { feedback, autoScore, maxScore, needsManualReview };
}

// Dispatches to the right grader for the activity type. `debug` grades like a code challenge:
// the student fixes broken starter code and it's validated against the same test cases.
export async function gradeActivity(
  type: ActivityType,
  config: ActivityConfig,
  answer: unknown,
  executor: CodeExecutor = codeExecutor,
): Promise<GradeResult> {
  switch (type) {
    case 'quiz':
      return gradeQuiz(config as QuizConfig, answer as QuizAnswer);
    case 'fill_blank':
      return gradeFillBlank(config as FillBlankConfig, answer as FillBlankAnswer);
    case 'code_challenge':
    case 'debug':
      return gradeCodeChallenge(config as CodeChallengeConfig, answer as CodeAnswer, executor);
    default:
      return { score: 0, passed: false, feedback: 'Unknown activity type.' };
  }
}
