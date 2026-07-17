import type { DyasContextType, DyasMessage } from '../models/DyasConversation';
export interface DyasContext {
    type: DyasContextType;
    summary: string;
}
export declare function buildSystemPrompt(context: DyasContext): string;
export declare function toClaudeMessages(history: DyasMessage[]): {
    role: 'user' | 'assistant';
    content: string;
}[];
export interface DyasClient {
    reply(history: DyasMessage[], context: DyasContext): Promise<string>;
}
export declare const dyasClient: DyasClient;
//# sourceMappingURL=dyas.service.d.ts.map