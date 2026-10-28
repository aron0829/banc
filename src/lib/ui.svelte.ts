import { flushSync, type Component } from 'svelte';
import { monthOf, todayDay, yearOf, type Day, type Month } from './dates';
import { monthInYear, rollToday } from './rules';

export interface Popup {
  id: number;
  component: Component<any>;
  props: Record<string, unknown>;
}

class UI {
  today = $state<Day>(todayDay());
  view = $state<View>('month');
  month = $state<Month>(monthOf(todayDay()));
  year = $state(yearOf(todayDay()));
  popups = $state.raw<Popup[]>([]);
}

export const ui = new UI();

let nextId = 1;

/** Mounts synchronously, so a popup can focus a field while still inside the tap (iOS only opens the keyboard then). */
export function openPopup<P extends Record<string, unknown>>(component: Component<P>, props: P): void {
  flushSync(() => (ui.popups = [...ui.popups, { id: nextId++, component, props }]));
}

/** Mirrors the visual viewport (shrinks when the keyboard opens) into CSS variables for the popups. */
export function trackViewport(): void {
  const vv = window.visualViewport;
  if (!vv) return;
  const set = () => {
    const root = document.documentElement.style;
    root.setProperty('--vv-height', `${vv.height}px`);
    root.setProperty('--vv-top', `${vv.offsetTop}px`);
  };
  set();
  vv.addEventListener('resize', set);
  vv.addEventListener('scroll', set);
}

/** Closes the top-most popup. */
export function closePopup(): void {
  ui.popups = ui.popups.slice(0, -1);
}

/** Keeps "today" correct when the app stays open over midnight. */
export function refreshToday(): void {
  const now = todayDay();
  if (now === ui.today) return;
  setMonth(rollToday(ui.today, now, ui.month));
  ui.today = now;
}

export function closeAllPopups(): void {
  ui.popups = [];
}

export type View = 'month' | 'overview';

/** Month and year stay in step, so swiping between the two pages always shows matching periods. */
export function setMonth(m: Month): void {
  ui.month = m;
  ui.year = yearOf(m);
}

export function setYear(y: number): void {
  ui.year = y;
  if (yearOf(ui.month) !== y) ui.month = monthInYear(y, ui.today);
}

export function showView(v: View): void {
  ui.view = v;
}

export function showMonth(m: Month): void {
  setMonth(m);
  ui.view = 'month';
}

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem('banc-theme', t);
  } catch {
    // private mode: theme just isn't remembered
  }
}
