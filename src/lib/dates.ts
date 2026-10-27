export type Month = string; // 'YYYY-MM'
export type Day = string; // 'YYYY-MM-DD'

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const pad = (n: number) => String(n).padStart(2, '0');
const parts = (d: string) => d.split('-').map(Number);

export function todayDay(now = new Date()): Day {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const monthOf = (d: Day): Month => d.slice(0, 7);
export const yearOf = (d: Day | Month): number => Number(d.slice(0, 4));

export function addMonths(m: Month, n: number): Month {
  const [y, mo] = parts(m);
  const idx = y * 12 + (mo - 1) + n;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

export function addDays(d: Day, n: number): Day {
  const [y, m, day] = parts(d);
  const dt = new Date(Date.UTC(y, m - 1, day + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function daysInMonth(m: Month): number {
  const [y, mo] = parts(m);
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

export const monthLabel = (m: Month): string => MONTHS[parts(m)[1] - 1];
export const shortMonth = (m: Month): string => `${SHORT[parts(m)[1] - 1]} ${m.slice(2, 4)}`;

export function dayLabel(d: Day): string {
  const [, m, day] = parts(d);
  return `${day}. ${SHORT[m - 1]}`;
}

export function fullDate(d: Day): string {
  const [y, m, day] = parts(d);
  return `${pad(day)}.${pad(m)}.${y}`;
}

export function shortDate(d: Day): string {
  return fullDate(d).replace(/\d\d(\d\d)$/, '$1');
}

/** All 12 months of a year. */
export function monthsOfYear(year: number): Month[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${pad(i + 1)}`);
}
