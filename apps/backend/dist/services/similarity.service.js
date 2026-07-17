"use strict";
// Code-similarity detection for anti-cheating. Token-set Jaccard similarity is
// deliberately simple: it catches copy-paste (with renamed variables it still
// scores high on structure tokens) without external services. Dyas AI
// conversations are intentionally NOT an input to any cheating signal — using
// the tutor must never look like cheating.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASTED_CHARS_FLAG_THRESHOLD = exports.TAB_SWITCH_FLAG_THRESHOLD = exports.MIN_TOKENS_FOR_FLAG = exports.SIMILARITY_FLAG_THRESHOLD = void 0;
exports.tokenize = tokenize;
exports.jaccardSimilarity = jaccardSimilarity;
exports.isSuspiciouslySimilar = isSuspiciouslySimilar;
exports.behavioralFlags = behavioralFlags;
exports.SIMILARITY_FLAG_THRESHOLD = 0.85;
// Short snippets are legitimately near-identical; require a minimum size.
exports.MIN_TOKENS_FOR_FLAG = 30;
function tokenize(code) {
    return code
        .split(/[^A-Za-z0-9_]+/)
        .map((t) => t.trim())
        .filter(Boolean);
}
function jaccardSimilarity(codeA, codeB) {
    const setA = new Set(tokenize(codeA));
    const setB = new Set(tokenize(codeB));
    if (setA.size === 0 && setB.size === 0)
        return 0;
    let intersection = 0;
    for (const token of setA) {
        if (setB.has(token))
            intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}
function isSuspiciouslySimilar(codeA, codeB) {
    const score = jaccardSimilarity(codeA, codeB);
    const bigEnough = tokenize(codeA).length >= exports.MIN_TOKENS_FOR_FLAG && tokenize(codeB).length >= exports.MIN_TOKENS_FOR_FLAG;
    return { similar: bigEnough && score >= exports.SIMILARITY_FLAG_THRESHOLD, score };
}
// Behavioral metadata thresholds (captured client-side during assessments).
exports.TAB_SWITCH_FLAG_THRESHOLD = 5;
exports.PASTED_CHARS_FLAG_THRESHOLD = 200;
function behavioralFlags(meta) {
    if (!meta)
        return [];
    const flags = [];
    if ((meta.tabSwitches ?? 0) >= exports.TAB_SWITCH_FLAG_THRESHOLD) {
        flags.push(`Switched tabs ${meta.tabSwitches} times during the assessment`);
    }
    if ((meta.pastedChars ?? 0) >= exports.PASTED_CHARS_FLAG_THRESHOLD) {
        flags.push(`Pasted ${meta.pastedChars} characters into answers`);
    }
    return flags;
}
//# sourceMappingURL=similarity.service.js.map