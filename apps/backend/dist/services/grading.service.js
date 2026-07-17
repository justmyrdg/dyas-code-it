"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeQuiz = gradeQuiz;
exports.gradeFillBlank = gradeFillBlank;
exports.gradeCodeChallenge = gradeCodeChallenge;
exports.gradeAssessmentAuto = gradeAssessmentAuto;
exports.gradeActivity = gradeActivity;
const code_execution_service_1 = require("./code-execution.service");
// Normalizes program/expected output for comparison: trailing whitespace and CRLF differences
// shouldn't fail an otherwise-correct answer.
function normalizeOutput(value) {
    return value.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '');
}
function gradeQuiz(config, answer) {
    const passed = answer.selectedIndex === config.correctIndex;
    return {
        score: passed ? 100 : 0,
        passed,
        feedback: passed ? 'Correct!' : 'Not quite — review the lesson and try again.',
    };
}
function gradeFillBlank(config, answer) {
    const total = config.answers.length;
    if (total === 0)
        return { score: 100, passed: true, feedback: 'Nothing to grade.' };
    let correct = 0;
    for (let i = 0; i < total; i++) {
        const expected = (config.answers[i] ?? '').trim().toLowerCase();
        const given = (answer.values[i] ?? '').trim().toLowerCase();
        if (expected === given)
            correct++;
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
async function gradeCodeChallenge(config, answer, executor = code_execution_service_1.codeExecutor) {
    const cases = config.testCases ?? [];
    if (cases.length === 0) {
        return { score: 100, passed: true, feedback: 'No test cases configured.' };
    }
    const details = [];
    let passedCount = 0;
    for (const testCase of cases) {
        const run = await executor.execute({
            language: config.language,
            source: answer.source,
            stdin: testCase.stdin,
        });
        const passed = !run.timedOut && normalizeOutput(run.stdout) === normalizeOutput(testCase.expectedStdout);
        if (passed)
            passedCount++;
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
// Auto-grades the objective (mcq) and code questions of an assessment. Short-answer questions
// are recorded with 0 points and autoGraded=false so a teacher can score them later.
async function gradeAssessmentAuto(questions, answers, executor = code_execution_service_1.codeExecutor) {
    const feedback = [];
    let autoScore = 0;
    let maxScore = 0;
    let needsManualReview = false;
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers[i];
        maxScore += question.points;
        if (question.type === 'mcq') {
            const cfg = question.config;
            const selected = answer?.selectedIndex;
            const correct = selected === cfg.correctIndex;
            const score = correct ? question.points : 0;
            autoScore += score;
            feedback.push({
                score,
                maxPoints: question.points,
                autoGraded: true,
                comment: correct ? 'Correct.' : 'Incorrect.',
            });
        }
        else if (question.type === 'code') {
            const cfg = question.config;
            const result = await gradeCodeChallenge(cfg, answer ?? { source: '' }, executor);
            const score = Math.round((result.score / 100) * question.points);
            autoScore += score;
            feedback.push({
                score,
                maxPoints: question.points,
                autoGraded: true,
                comment: result.feedback,
                details: result.details,
            });
        }
        else {
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
async function gradeActivity(type, config, answer, executor = code_execution_service_1.codeExecutor) {
    switch (type) {
        case 'quiz':
            return gradeQuiz(config, answer);
        case 'fill_blank':
            return gradeFillBlank(config, answer);
        case 'code_challenge':
        case 'debug':
            return gradeCodeChallenge(config, answer, executor);
        default:
            return { score: 0, passed: false, feedback: 'Unknown activity type.' };
    }
}
//# sourceMappingURL=grading.service.js.map