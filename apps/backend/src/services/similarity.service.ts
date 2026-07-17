// Code-similarity detection for anti-cheating. Token-set Jaccard similarity is
// deliberately simple: it catches copy-paste (with renamed variables it still
// scores high on structure tokens) without external services. Dyas AI
// conversations are intentionally NOT an input to any cheating signal — using
// the tutor must never look like cheating.

export const SIMILARITY_FLAG_THRESHOLD = 0.85;
// Short snippets are legitimately near-identical; require a minimum size.
export const MIN_TOKENS_FOR_FLAG = 30;

export function tokenize(code: string): string[] {
  return code
    .split(/[^A-Za-z0-9_]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function jaccardSimilarity(codeA: string, codeB: string): number {
  const setA = new Set(tokenize(codeA));
  const setB = new Set(tokenize(codeB));
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function isSuspiciouslySimilar(codeA: string, codeB: string): { similar: boolean; score: number } {
  const score = jaccardSimilarity(codeA, codeB);
  const bigEnough =
    tokenize(codeA).length >= MIN_TOKENS_FOR_FLAG && tokenize(codeB).length >= MIN_TOKENS_FOR_FLAG;
  return { similar: bigEnough && score >= SIMILARITY_FLAG_THRESHOLD, score };
}

// Behavioral metadata thresholds (captured client-side during assessments).
export const TAB_SWITCH_FLAG_THRESHOLD = 5;
export const PASTED_CHARS_FLAG_THRESHOLD = 200;

export interface IntegrityMetadata {
  tabSwitches?: number;
  pastedChars?: number;
  timeSpentSeconds?: number;
}

export function behavioralFlags(meta: IntegrityMetadata | null | undefined): string[] {
  if (!meta) return [];
  const flags: string[] = [];
  if ((meta.tabSwitches ?? 0) >= TAB_SWITCH_FLAG_THRESHOLD) {
    flags.push(`Switched tabs ${meta.tabSwitches} times during the assessment`);
  }
  if ((meta.pastedChars ?? 0) >= PASTED_CHARS_FLAG_THRESHOLD) {
    flags.push(`Pasted ${meta.pastedChars} characters into answers`);
  }
  return flags;
}
