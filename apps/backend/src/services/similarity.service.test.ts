import { describe, it, expect } from 'vitest';
import {
  jaccardSimilarity,
  isSuspiciouslySimilar,
  behavioralFlags,
  tokenize,
} from './similarity.service';

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

describe('tokenize', () => {
  it('splits on non-identifier characters and drops empties', () => {
    expect(tokenize('def foo(a, b):\n  return a+b')).toEqual([
      'def', 'foo', 'a', 'b', 'return', 'a', 'b',
    ]);
  });
});

describe('jaccardSimilarity', () => {
  it('is 1 for identical code', () => {
    expect(jaccardSimilarity(LONG_CODE, LONG_CODE)).toBe(1);
  });

  it('is low for unrelated code', () => {
    const other = 'class Stack:\n    items = []\n    push = None\n    pop = None';
    expect(jaccardSimilarity(LONG_CODE, other)).toBeLessThan(0.3);
  });

  it('is 0 for two empty strings', () => {
    expect(jaccardSimilarity('', '')).toBe(0);
  });
});

describe('isSuspiciouslySimilar', () => {
  it('flags identical long submissions', () => {
    const result = isSuspiciouslySimilar(LONG_CODE, LONG_CODE);
    expect(result.similar).toBe(true);
    expect(result.score).toBe(1);
  });

  it('does not flag identical but tiny snippets', () => {
    const tiny = 'print("hello")';
    expect(isSuspiciouslySimilar(tiny, tiny).similar).toBe(false);
  });
});

describe('behavioralFlags', () => {
  it('returns no flags for clean metadata', () => {
    expect(behavioralFlags({ tabSwitches: 1, pastedChars: 10 })).toEqual([]);
    expect(behavioralFlags(null)).toEqual([]);
  });

  it('flags heavy tab switching and large pastes', () => {
    const flags = behavioralFlags({ tabSwitches: 8, pastedChars: 500 });
    expect(flags).toHaveLength(2);
    expect(flags[0]).toContain('tabs');
    expect(flags[1]).toContain('Pasted');
  });
});
