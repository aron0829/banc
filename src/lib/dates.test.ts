import { describe, expect, it } from 'vitest';
import { addDays, addMonths, dayLabel, daysInMonth, fullDate, monthLabel, monthOf, shortDate, shortMonth } from './dates';

describe('dates', () => {
  it('adds months across year boundaries', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-10', 14)).toBe('2027-12');
  });
  it('adds days across month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('knows month lengths', () => {
    expect(daysInMonth('2026-10')).toBe(31);
    expect(daysInMonth('2028-02')).toBe(29);
  });
  it('formats labels like the designs', () => {
    expect(monthOf('2026-10-26')).toBe('2026-10');
    expect(monthLabel('2026-10')).toBe('Oktober');
    expect(shortMonth('2024-03')).toBe('Mär 24');
    expect(dayLabel('2026-10-01')).toBe('1. Okt');
    expect(fullDate('2026-10-26')).toBe('26.10.2026');
    expect(shortDate('2026-10-25')).toBe('25.10.26');
  });
});
