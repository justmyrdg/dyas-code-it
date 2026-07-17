"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const similarity_service_1 = require("./similarity.service");
const LONG_CODE = `
def calculate_total(prices, tax_rate):
    subtotal = 0
    for price in prices:
        subtotal = subtotal + price
    tax_amount = subtotal * tax_rate
    total = subtotal + tax_amount
    return round(total, 2)

def apply_discount(total, discount_percent):
    discount = total * discount_percent / 100
    return total - discount
`;
(0, vitest_1.describe)('tokenize', () => {
    (0, vitest_1.it)('splits on non-identifier characters and drops empties', () => {
        (0, vitest_1.expect)((0, similarity_service_1.tokenize)('def foo(a, b):\n  return a+b')).toEqual([
            'def', 'foo', 'a', 'b', 'return', 'a', 'b',
        ]);
    });
});
(0, vitest_1.describe)('jaccardSimilarity', () => {
    (0, vitest_1.it)('is 1 for identical code', () => {
        (0, vitest_1.expect)((0, similarity_service_1.jaccardSimilarity)(LONG_CODE, LONG_CODE)).toBe(1);
    });
    (0, vitest_1.it)('is low for unrelated code', () => {
        const other = 'class Stack:\n    items = []\n    push = None\n    pop = None';
        (0, vitest_1.expect)((0, similarity_service_1.jaccardSimilarity)(LONG_CODE, other)).toBeLessThan(0.3);
    });
    (0, vitest_1.it)('is 0 for two empty strings', () => {
        (0, vitest_1.expect)((0, similarity_service_1.jaccardSimilarity)('', '')).toBe(0);
    });
});
(0, vitest_1.describe)('isSuspiciouslySimilar', () => {
    (0, vitest_1.it)('flags identical long submissions', () => {
        const result = (0, similarity_service_1.isSuspiciouslySimilar)(LONG_CODE, LONG_CODE);
        (0, vitest_1.expect)(result.similar).toBe(true);
        (0, vitest_1.expect)(result.score).toBe(1);
    });
    (0, vitest_1.it)('does not flag identical but tiny snippets', () => {
        const tiny = 'print("hello")';
        (0, vitest_1.expect)((0, similarity_service_1.isSuspiciouslySimilar)(tiny, tiny).similar).toBe(false);
    });
});
(0, vitest_1.describe)('behavioralFlags', () => {
    (0, vitest_1.it)('returns no flags for clean metadata', () => {
        (0, vitest_1.expect)((0, similarity_service_1.behavioralFlags)({ tabSwitches: 1, pastedChars: 10 })).toEqual([]);
        (0, vitest_1.expect)((0, similarity_service_1.behavioralFlags)(null)).toEqual([]);
    });
    (0, vitest_1.it)('flags heavy tab switching and large pastes', () => {
        const flags = (0, similarity_service_1.behavioralFlags)({ tabSwitches: 8, pastedChars: 500 });
        (0, vitest_1.expect)(flags).toHaveLength(2);
        (0, vitest_1.expect)(flags[0]).toContain('tabs');
        (0, vitest_1.expect)(flags[1]).toContain('Pasted');
    });
});
//# sourceMappingURL=similarity.service.test.js.map