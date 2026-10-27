import { describe, expect, it } from 'vitest';
import { amountAllowed, rollToday } from './rules';

describe('amountAllowed', () => {
  it('allows negative amounts only in the overview', () => {
    expect(amountAllowed('overview', -1000)).toBe(true);
    expect(amountAllowed('expense', -1000)).toBe(false);
    expect(amountAllowed('income', -1)).toBe(false);
    expect(amountAllowed('expense', 0)).toBe(true);
    expect(amountAllowed('expense', null)).toBe(false);
  });
});

describe('rollToday', () => {
  it('follows the new current month when the user was looking at the old one', () => {
    expect(rollToday('2026-10-31', '2026-11-02', '2026-10')).toBe('2026-11');
  });
  it('keeps a month the user navigated to on purpose', () => {
    expect(rollToday('2026-10-31', '2026-11-02', '2026-07')).toBe('2026-07');
  });
});
