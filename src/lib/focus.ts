import type { Action } from 'svelte/action';

/** Focuses the element as soon as it is mounted (opens the keyboard for a price field). */
export const focusNow: Action<HTMLInputElement, boolean | undefined> = (node, on = true) => {
  if (!on) return;
  node.focus({ preventScroll: true });
  node.setSelectionRange(node.value.length, node.value.length);
};
