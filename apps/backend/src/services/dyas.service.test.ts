import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, toClaudeMessages } from './dyas.service';
import type { DyasMessage } from '../models/DyasConversation';

describe('buildSystemPrompt', () => {
  it('always contains the Socratic no-direct-answers rule', () => {
    const prompt = buildSystemPrompt({ type: 'general', summary: '' });
    expect(prompt).toContain('NEVER give direct answers');
  });

  it('adds the exam restriction only for assessment context', () => {
    const exam = buildSystemPrompt({ type: 'assessment', summary: 'x' });
    const lesson = buildSystemPrompt({ type: 'lesson', summary: 'x' });
    expect(exam).toContain('graded assessment');
    expect(lesson).not.toContain('graded assessment');
  });

  it('injects the context summary when present', () => {
    const prompt = buildSystemPrompt({ type: 'lesson', summary: 'Lesson "Loops in Python"' });
    expect(prompt).toContain('Loops in Python');
  });

  it('omits the working-on section when summary is empty', () => {
    const prompt = buildSystemPrompt({ type: 'general', summary: '' });
    expect(prompt).not.toContain('currently working on');
  });
});

describe('toClaudeMessages', () => {
  it('maps student→user and dyas→assistant', () => {
    const history: DyasMessage[] = [
      { role: 'student', content: 'hi', timestamp: 't1' },
      { role: 'dyas', content: 'hello', timestamp: 't2' },
    ];
    expect(toClaudeMessages(history)).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
    ]);
  });

  it('caps replayed history at 20 messages, keeping the most recent', () => {
    const history: DyasMessage[] = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? ('student' as const) : ('dyas' as const),
      content: `msg${i}`,
      timestamp: String(i),
    }));
    const mapped = toClaudeMessages(history);
    expect(mapped).toHaveLength(20);
    expect(mapped[mapped.length - 1].content).toBe('msg29');
    expect(mapped[0].content).toBe('msg10');
  });
});
