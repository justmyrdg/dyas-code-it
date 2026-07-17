export declare const SIMILARITY_FLAG_THRESHOLD = 0.85;
export declare const MIN_TOKENS_FOR_FLAG = 30;
export declare function tokenize(code: string): string[];
export declare function jaccardSimilarity(codeA: string, codeB: string): number;
export declare function isSuspiciouslySimilar(codeA: string, codeB: string): {
    similar: boolean;
    score: number;
};
export declare const TAB_SWITCH_FLAG_THRESHOLD = 5;
export declare const PASTED_CHARS_FLAG_THRESHOLD = 200;
export interface IntegrityMetadata {
    tabSwitches?: number;
    pastedChars?: number;
    timeSpentSeconds?: number;
}
export declare function behavioralFlags(meta: IntegrityMetadata | null | undefined): string[];
//# sourceMappingURL=similarity.service.d.ts.map