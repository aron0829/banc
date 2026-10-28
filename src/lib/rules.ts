import { monthOf, yearOf, type Day, type Month } from './dates';
import type { Scope } from './model';

/** Negative amounts only make sense in the overview (e.g. "Schulden -10", "Zusätzliche Ausgaben"). */
export function amountAllowed(scope: Scope, amount: number | null): boolean {
  return amount !== null && (scope === 'overview' || amount >= 0);
}

/** The month to show for a year: today's month in the current year, else the month closest to today. */
export function monthInYear(year: number, today: Day): Month {
  const thisYear = yearOf(today);
  return year === thisYear ? monthOf(today) : year < thisYear ? `${year}-12` : `${year}-01`;
}

/** When the day changes while the app is open: follow the new month if the old current month was shown. */
export function rollToday(previous: Day, now: Day, viewed: Month): Month {
  return viewed === monthOf(previous) ? monthOf(now) : viewed;
}
