"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const grading_service_1 = require("./grading.service");
// A fake executor that returns queued results in order — lets us grade code challenges
// without hitting the real Piston service.
function fakeExecutor(results) {
    const queue = results.map((r) => ({
        stdout: '',
        stderr: '',
        exitCode: 0,
        timedOut: false,
        ...r,
    }));
    return {
        listLanguages: vitest_1.vi.fn(),
        execute: vitest_1.vi.fn(async () => queue.shift()),
    };
}
(0, vitest_1.describe)('gradeQuiz', () => {
    const config = { options: ['a', 'b', 'c'], correctIndex: 1 };
    (0, vitest_1.it)('passes when the selected index matches', () => {
        (0, vitest_1.expect)((0, grading_service_1.gradeQuiz)(config, { selectedIndex: 1 })).toMatchObject({ score: 100, passed: true });
    });
    (0, vitest_1.it)('fails when the selected index is wrong', () => {
        (0, vitest_1.expect)((0, grading_service_1.gradeQuiz)(config, { selectedIndex: 0 })).toMatchObject({ score: 0, passed: false });
    });
});
(0, vitest_1.describe)('gradeFillBlank', () => {
    const config = { answers: ['for', 'range'] };
    (0, vitest_1.it)('passes only when every blank matches (case/space-insensitive)', () => {
        (0, vitest_1.expect)((0, grading_service_1.gradeFillBlank)(config, { values: [' For ', 'RANGE'] })).toMatchObject({
            score: 100,
            passed: true,
        });
    });
    (0, vitest_1.it)('gives partial credit and does not pass', () => {
        const result = (0, grading_service_1.gradeFillBlank)(config, { values: ['for', 'wrong'] });
        (0, vitest_1.expect)(result.passed).toBe(false);
        (0, vitest_1.expect)(result.score).toBe(50);
    });
});
(0, vitest_1.describe)('gradeCodeChallenge', () => {
    const config = {
        language: 'python',
        testCases: [
            { stdin: '', expectedStdout: 'hello\n' },
            { stdin: '', expectedStdout: 'world' },
        ],
    };
    (0, vitest_1.it)('passes when all test cases match (ignoring trailing whitespace)', async () => {
        const executor = fakeExecutor([{ stdout: 'hello' }, { stdout: 'world\n' }]);
        const result = await (0, grading_service_1.gradeCodeChallenge)(config, { source: 'code' }, executor);
        (0, vitest_1.expect)(result).toMatchObject({ score: 100, passed: true });
        (0, vitest_1.expect)(result.details).toHaveLength(2);
    });
    (0, vitest_1.it)('reports partial pass count when some cases fail', async () => {
        const executor = fakeExecutor([{ stdout: 'hello' }, { stdout: 'nope' }]);
        const result = await (0, grading_service_1.gradeCodeChallenge)(config, { source: 'code' }, executor);
        (0, vitest_1.expect)(result.passed).toBe(false);
        (0, vitest_1.expect)(result.score).toBe(50);
    });
    (0, vitest_1.it)('fails a timed-out test case', async () => {
        const executor = fakeExecutor([{ stdout: 'hello' }, { timedOut: true, stdout: '' }]);
        const result = await (0, grading_service_1.gradeCodeChallenge)(config, { source: 'code' }, executor);
        (0, vitest_1.expect)(result.passed).toBe(false);
        (0, vitest_1.expect)(result.details?.[1].stderr).toContain('timed out');
    });
});
(0, vitest_1.describe)('gradeAssessmentAuto', () => {
    const questions = [
        { type: 'mcq', prompt: 'pick', points: 10, config: { options: ['a', 'b'], correctIndex: 1 } },
        { type: 'code', prompt: 'code', points: 20, config: { language: 'python', testCases: [{ stdin: '', expectedStdout: 'ok' }] } },
        { type: 'short_answer', prompt: 'explain', points: 10, config: {} },
    ];
    (0, vitest_1.it)('auto-scores mcq and code, flags short_answer for manual review', async () => {
        const executor = fakeExecutor([{ stdout: 'ok' }]);
        const result = await (0, grading_service_1.gradeAssessmentAuto)(questions, [{ selectedIndex: 1 }, { source: 'print("ok")' }, { text: 'because' }], executor);
        (0, vitest_1.expect)(result.maxScore).toBe(40);
        (0, vitest_1.expect)(result.autoScore).toBe(30); // 10 (mcq) + 20 (code) ; short_answer pending
        (0, vitest_1.expect)(result.needsManualReview).toBe(true);
        (0, vitest_1.expect)(result.feedback[2].autoGraded).toBe(false);
    });
    (0, vitest_1.it)('awards partial code points proportional to passing test cases', async () => {
        const q = [
            { type: 'code', prompt: 'c', points: 10, config: { language: 'python', testCases: [
                        { stdin: '', expectedStdout: 'a' },
                        { stdin: '', expectedStdout: 'b' },
                    ] } },
        ];
        const executor = fakeExecutor([{ stdout: 'a' }, { stdout: 'wrong' }]);
        const result = await (0, grading_service_1.gradeAssessmentAuto)(q, [{ source: 'x' }], executor);
        (0, vitest_1.expect)(result.autoScore).toBe(5); // 1 of 2 cases -> half of 10 points
        (0, vitest_1.expect)(result.needsManualReview).toBe(false);
    });
});
(0, vitest_1.describe)('gradeActivity dispatch', () => {
    (0, vitest_1.it)('routes debug tasks through code-challenge grading', async () => {
        const executor = fakeExecutor([{ stdout: '42' }]);
        const result = await (0, grading_service_1.gradeActivity)('debug', { language: 'python', testCases: [{ stdin: '', expectedStdout: '42' }] }, { source: 'print(42)' }, executor);
        (0, vitest_1.expect)(result).toMatchObject({ score: 100, passed: true });
    });
});
//# sourceMappingURL=grading.service.test.js.map