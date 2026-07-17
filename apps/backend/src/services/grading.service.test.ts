import { describe, it, expect, vi } from 'vitest';
import {
  gradeQuiz,
  gradeFillBlank,
  gradeCodeChallenge,
  gradeActivity,
  gradeAssessmentAuto,
  type AssessmentQuestion,
} from './grading.service';
import type { CodeExecutor, ExecuteResult } from './code-execution.service';

// A fake executor that returns queued results in order — lets us grade code challenges
// without hitting the real Piston service.
function fakeExecutor(results: Partial<ExecuteResult>[]): CodeExecutor {
  const queue = results.map((r) => ({
    stdout: '',
    stderr: '',
    exitCode: 0,
    timedOut: false,
    ...r,
  }));
  return {
    listLanguages: vi.fn(),
    execute: vi.fn(async () => queue.shift() as ExecuteResult),
  };
}

describe('gradeQuiz', () => {
  const config = { options: ['a', 'b', 'c'], correctIndex: 1 };

  it('passes when the selected index matches', () => {
    expect(gradeQuiz(config, { selectedIndex: 1 })).toMatchObject({ score: 100, passed: true });
  });

  it('fails when the selected index is wrong', () => {
    expect(gradeQuiz(config, { selectedIndex: 0 })).toMatchObject({ score: 0, passed: false });
  });
});

describe('gradeFillBlank', () => {
  const config = { answers: ['for', 'range'] };

  it('passes only when every blank matches (case/space-insensitive)', () => {
    expect(gradeFillBlank(config, { values: [' For ', 'RANGE'] })).toMatchObject({
      score: 100,
      passed: true,
    });
  });

  it('gives partial credit and does not pass', () => {
    const result = gradeFillBlank(config, { values: ['for', 'wrong'] });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(50);
  });
});

describe('gradeCodeChallenge', () => {
  const config = {
    language: 'python',
    testCases: [
      { stdin: '', expectedStdout: 'hello\n' },
      { stdin: '', expectedStdout: 'world' },
    ],
  };

  it('passes when all test cases match (ignoring trailing whitespace)', async () => {
    const executor = fakeExecutor([{ stdout: 'hello' }, { stdout: 'world\n' }]);
    const result = await gradeCodeChallenge(config, { source: 'code' }, executor);
    expect(result).toMatchObject({ score: 100, passed: true });
    expect(result.details).toHaveLength(2);
  });

  it('reports partial pass count when some cases fail', async () => {
    const executor = fakeExecutor([{ stdout: 'hello' }, { stdout: 'nope' }]);
    const result = await gradeCodeChallenge(config, { source: 'code' }, executor);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(50);
  });

  it('fails a timed-out test case', async () => {
    const executor = fakeExecutor([{ stdout: 'hello' }, { timedOut: true, stdout: '' }]);
    const result = await gradeCodeChallenge(config, { source: 'code' }, executor);
    expect(result.passed).toBe(false);
    expect(result.details?.[1].stderr).toContain('timed out');
  });
});

describe('gradeAssessmentAuto', () => {
  const questions: AssessmentQuestion[] = [
    { type: 'mcq', prompt: 'pick', points: 10, config: { options: ['a', 'b'], correctIndex: 1 } },
    { type: 'code', prompt: 'code', points: 20, config: { language: 'python', testCases: [{ stdin: '', expectedStdout: 'ok' }] } },
    { type: 'short_answer', prompt: 'explain', points: 10, config: {} },
  ];

  it('auto-scores mcq and code, flags short_answer for manual review', async () => {
    const executor = fakeExecutor([{ stdout: 'ok' }]);
    const result = await gradeAssessmentAuto(
      questions,
      [{ selectedIndex: 1 }, { source: 'print("ok")' }, { text: 'because' }],
      executor,
    );
    expect(result.maxScore).toBe(40);
    expect(result.autoScore).toBe(30); // 10 (mcq) + 20 (code) ; short_answer pending
    expect(result.needsManualReview).toBe(true);
    expect(result.feedback[2].autoGraded).toBe(false);
  });

  it('awards partial code points proportional to passing test cases', async () => {
    const q: AssessmentQuestion[] = [
      { type: 'code', prompt: 'c', points: 10, config: { language: 'python', testCases: [
        { stdin: '', expectedStdout: 'a' },
        { stdin: '', expectedStdout: 'b' },
      ] } },
    ];
    const executor = fakeExecutor([{ stdout: 'a' }, { stdout: 'wrong' }]);
    const result = await gradeAssessmentAuto(q, [{ source: 'x' }], executor);
    expect(result.autoScore).toBe(5); // 1 of 2 cases -> half of 10 points
    expect(result.needsManualReview).toBe(false);
  });
});

describe('gradeActivity dispatch', () => {
  it('routes debug tasks through code-challenge grading', async () => {
    const executor = fakeExecutor([{ stdout: '42' }]);
    const result = await gradeActivity(
      'debug',
      { language: 'python', testCases: [{ stdin: '', expectedStdout: '42' }] },
      { source: 'print(42)' },
      executor,
    );
    expect(result).toMatchObject({ score: 100, passed: true });
  });
});
