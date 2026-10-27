import type { Component } from 'svelte';
import { monthOf, todayDay, yearOf, type Month } from './dates';

export interface Popup {
  id: number;
  component: Component<any>;
  props: Record<string, unknown>;
}

class UI {
  view = $state<'month' | 'overview'>('month');
  month = $state<Month>(monthOf(todayDay()));
  year = $state(yearOf(todayDay()));
  popups = $state.raw<Popup[]>([]);
}

export const ui = new UI();

let nextId = 1;

export function openPopup<P extends Record<string, unknown>>(component: Component<P>, props: P): void {
  ui.popups = [...ui.popups, { id: nextId++, component, props }];
}

/** Closes the top-most popup. */
export function closePopup(): void {
  ui.popups = ui.popups.slice(0, -1);
}

export function closeAllPopups(): void {
  ui.popups = [];
}

export function showMonth(m: Month): void {
  ui.month = m;
  ui.view = 'month';
}

export function showYear(y: number): void {
  ui.year = y;
  ui.view = 'overview';
}

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem('banc-theme', t);
  } catch {
    // private mode: theme just isn't remembered
  }
}
