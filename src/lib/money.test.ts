import { describe, expect, it } from 'vitest';
import { earnings, formatAmount, formatHours, parseAmount, parseHours } from './money';

describe('parseAmount', () => {
  it('accepts comma and dot decimals', () => {
    expect(parseAmount('2,30')).toBe(230);
    expect(parseAmount('2.3')).toBe(230);
    expect(parseAmount('3000')).toBe(300000);
  });
  it('accepts sign, euro symbol and spaces', () => {
    expect(parseAmount('-10')).toBe(-1000);
    expect(parseAmount(' -10.00 € ')).toBe(-1000);
    expect(parseAmount('100 €')).toBe(10000);
  });
  it('rejects empty, letters and ambiguous thousands formats', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('1.128,5')).toBeNull();
    expect(parseAmount('1,2,3')).toBeNull();
    expect(parseAmount('2.345')).toBeNull();
  });
});

describe('formatAmount', () => {
  it('formats cents with two decimals and euro sign', () => {
    expect(formatAmount(112800)).toBe('1128.00 €');
    expect(formatAmount(-1000)).toBe('-10.00 €');
    expect(formatAmount(449)).toBe('4.49 €');
    expect(formatAmount(0)).toBe('0.00 €');
  });
  it('can show an explicit plus sign', () => {
    expect(formatAmount(128000, true)).toBe('+1280.00 €');
    expect(formatAmount(-500, true)).toBe('-5.00 €');
  });
});

describe('hours', () => {
  it('parses whole and decimal hours', () => {
    expect(parseHours('5')).toBe(5);
    expect(parseHours('1,5')).toBe(1.5);
    expect(parseHours(' 2.25 ')).toBe(2.25);
  });
  it('rejects invalid input', () => {
    expect(parseHours('')).toBeNull();
    expect(parseHours('-1')).toBeNull();
    expect(parseHours('1.234')).toBeNull();
  });
  it('formats without trailing zeros', () => {
    expect(formatHours(5)).toBe('5 h');
    expect(formatHours(1.5)).toBe('1.5 h');
  });
  it('rounds earnings to cents', () => {
    expect(earnings(5, 1500)).toBe(7500);
    expect(earnings(1.33, 1250)).toBe(1663);
  });
});
