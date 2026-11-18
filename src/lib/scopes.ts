import { BanknoteArrowDown, BanknoteArrowUp, CircleDollarSign, Lock, ScrollText, Sprout } from '@lucide/svelte';
import type { Component } from 'svelte';
import type { Scope } from './model';

export type Tone = 'neutral' | 'income' | 'expense' | 'danger';

export const SCOPES: Record<Scope, { title: string; icon: Component; tone: Tone }> = {
  income: { title: 'Einnahmen', icon: BanknoteArrowUp, tone: 'income' },
  fixed: { title: 'Fixkosten', icon: Lock, tone: 'expense' },
  invest: { title: 'Investments', icon: Sprout, tone: 'expense' },
  expense: { title: 'Ausgaben', icon: BanknoteArrowDown, tone: 'expense' },
  varIncome: { title: 'Variable Einnahmen', icon: CircleDollarSign, tone: 'income' },
  overview: { title: 'Übersicht', icon: ScrollText, tone: 'neutral' },
};
