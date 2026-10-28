import { describe, expect, it } from 'vitest';
import { amountAllowed, monthInYear, rollToday } from './rules';

describe('amountAllowed', () => {
  it('allows negative amounts only in the overview', () => {
    expect(amountAllowed('overview', -1000)).toBe(true);
    expect(amountAllowed('expense', -1000)).toBe(false);
    expect(amountAllowed('income', -1)).toBe(false);
    expect(amountAllowed('expense', 0)).toBe(true);
    expect(amountAllowed('expense', null)).toBe(false);
  });
});

describe('monthInYear', () => {
  it('picks today in the current year and the month closest to today otherwise', () => {
    expect(monthInYear(2026, '2026-10-28')).toBe('2026-10');
    expect(monthInYear(2025, '2026-10-28')).toBe('2025-12');
    expect(monthInYear(2027, '2026-10-28')).toBe('2027-01');
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
