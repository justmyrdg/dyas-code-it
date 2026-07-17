"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const dyas_service_1 = require("./dyas.service");
(0, vitest_1.describe)('buildSystemPrompt', () => {
    (0, vitest_1.it)('always contains the Socratic no-direct-answers rule', () => {
        const prompt = (0, dyas_service_1.buildSystemPrompt)({ type: 'general', summary: '' });
        (0, vitest_1.expect)(prompt).toContain('NEVER give direct answers');
    });
    (0, vitest_1.it)('adds the exam restriction only for assessment context', () => {
        const exam = (0, dyas_service_1.buildSystemPrompt)({ type: 'assessment', summary: 'x' });
        const lesson = (0, dyas_service_1.buildSystemPrompt)({ type: 'lesson', summary: 'x' });
        (0, vitest_1.expect)(exam).toContain('graded assessment');
        (0, vitest_1.expect)(lesson).not.toContain('graded assessment');
    });
    (0, vitest_1.it)('injects the context summary when present', () => {
        const prompt = (0, dyas_service_1.buildSystemPrompt)({ type: 'lesson', summary: 'Lesson "Loops in Python"' });
        (0, vitest_1.expect)(prompt).toContain('Loops in Python');
    });
    (0, vitest_1.it)('omits the working-on section when summary is empty', () => {
        const prompt = (0, dyas_service_1.buildSystemPrompt)({ type: 'general', summary: '' });
        (0, vitest_1.expect)(prompt).not.toContain('currently working on');
    });
});
(0, vitest_1.describe)('toClaudeMessages', () => {
    (0, vitest_1.it)('maps student→user and dyas→assistant', () => {
        const history = [
            { role: 'student', content: 'hi', timestamp: 't1' },
            { role: 'dyas', content: 'hello', timestamp: 't2' },
        ];
        (0, vitest_1.expect)((0, dyas_service_1.toClaudeMessages)(history)).toEqual([
            { role: 'user', content: 'hi' },
            { role: 'assistant', content: 'hello' },
        ]);
    });
    (0, vitest_1.it)('caps replayed history at 20 messages, keeping the most recent', () => {
        const history = Array.from({ length: 30 }, (_, i) => ({
            role: i % 2 === 0 ? 'student' : 'dyas',
            content: `msg${i}`,
            timestamp: String(i),
        }));
        const mapped = (0, dyas_service_1.toClaudeMessages)(history);
        (0, vitest_1.expect)(mapped).toHaveLength(20);
        (0, vitest_1.expect)(mapped[mapped.length - 1].content).toBe('msg29');
        (0, vitest_1.expect)(mapped[0].content).toBe('msg10');
    });
});
//# sourceMappingURL=dyas.service.test.js.map