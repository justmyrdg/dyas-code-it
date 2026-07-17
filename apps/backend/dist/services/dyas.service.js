"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dyasClient = void 0;
exports.buildSystemPrompt = buildSystemPrompt;
exports.toClaudeMessages = toClaudeMessages;
const axios_1 = __importDefault(require("axios"));
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const DYAS_MODEL = process.env.DYAS_MODEL || 'claude-sonnet-5';
const DYAS_MAX_TOKENS = 1024;
// Cap how much history is replayed per request to bound token cost.
const MAX_HISTORY_MESSAGES = 20;
const BASE_SYSTEM_PROMPT = `You are Dyas, the friendly AI teaching assistant for DyasCodeIT, a coding education platform for students learning to program.

Your teaching philosophy — these rules are absolute:
1. NEVER give direct answers or complete solutions, even when asked repeatedly. Use the Socratic method: ask guiding questions, point at concepts, and let the student discover the answer.
2. When helping debug, help the student READ the error and reason about it — never rewrite their code for them. Tiny illustrative snippets (2-3 lines demonstrating a concept, not their task) are fine.
3. Explain concepts as many different ways as needed. Be encouraging, patient, and never condescending.
4. Keep replies concise — a few short paragraphs at most. One guiding question per reply.
5. If the student is completely stuck, give a progressively stronger hint, but still not the answer.
6. Stay on the topic of programming and their coursework. Politely decline anything else.`;
const ASSESSMENT_RESTRICTION = `

IMPORTANT — the student is currently taking a graded assessment. You may explain general concepts, but you must NOT discuss the specific assessment questions, review their answer code, or confirm whether an approach is correct. If asked, remind them kindly that during assessments you can only help with general concepts.`;
function buildSystemPrompt(context) {
    let prompt = BASE_SYSTEM_PROMPT;
    if (context.type === 'assessment') {
        prompt += ASSESSMENT_RESTRICTION;
    }
    if (context.summary) {
        prompt += `\n\nThe student is currently working on:\n${context.summary}`;
    }
    return prompt;
}
// Claude API roles are user/assistant; ours are student/dyas.
function toClaudeMessages(history) {
    return history.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
        role: m.role === 'student' ? 'user' : 'assistant',
        content: m.content,
    }));
}
class ClaudeDyasClient {
    async reply(history, context) {
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey || apiKey === 'your_claude_api_key') {
            throw new Error('CLAUDE_API_KEY is not configured.');
        }
        const response = await axios_1.default.post(CLAUDE_API_URL, {
            model: DYAS_MODEL,
            max_tokens: DYAS_MAX_TOKENS,
            system: buildSystemPrompt(context),
            messages: toClaudeMessages(history),
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            timeout: 30000,
        });
        const blocks = response.data.content ?? [];
        return blocks
            .filter((b) => b.type === 'text' && b.text)
            .map((b) => b.text)
            .join('\n')
            .trim();
    }
}
exports.dyasClient = new ClaudeDyasClient();
//# sourceMappingURL=dyas.service.js.map