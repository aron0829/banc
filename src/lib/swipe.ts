import type { Action } from 'svelte/action';

const SLOP = 10;

export interface SwipeHandlers {
  /** Horizontal distance since the finger went down, in px. */
  onMove: (dx: number) => void;
  /** velocity in px/ms, negative = towards the left; a cancelled swipe ends with (0, 0). */
  onEnd: (dx: number, velocity: number) => void;
}

/**
 * Horizontal swipes anywhere on the node. Vertical drags are left to the browser (card lists still scroll),
 * and the click at the end of a swipe is swallowed so nothing under the finger gets tapped.
 */
export const swipe: Action<HTMLElement, SwipeHandlers> = (node, handlers) => {
  let h = handlers;
  let start: { id: number; x: number; y: number } | null = null;
  let active = false;
  let last = { x: 0, t: 0 };
  let velocity = 0;

  const swallowClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const down = (e: PointerEvent) => {
    if (start || (e.pointerType === 'mouse' && e.button !== 0)) return;
    start = { id: e.pointerId, x: e.clientX, y: e.clientY };
    active = false;
  };
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!active) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      if (Math.abs(dx) <= Math.abs(dy)) {
        start = null;
        return;
      }
      active = true;
      velocity = 0;
      last = { x: e.clientX, t: e.timeStamp };
      node.setPointerCapture(e.pointerId);
    }
    const dt = e.timeStamp - last.t;
    if (dt > 0) velocity = 0.8 * ((e.clientX - last.x) / dt) + 0.2 * velocity;
    last = { x: e.clientX, t: e.timeStamp };
    h.onMove(dx);
  };
  const up = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    if (active) {
      // a finger that stopped before lifting shouldn't fling
      h.onEnd(e.clientX - start.x, e.timeStamp - last.t > 100 ? 0 : velocity);
      node.addEventListener('click', swallowClick, { capture: true, once: true });
      setTimeout(() => node.removeEventListener('click', swallowClick, { capture: true }), 300);
    }
    start = null;
    active = false;
  };
  const cancel = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    if (active) h.onEnd(0, 0);
    start = null;
    active = false;
  };
  // Safety net next to `touch-action: pan-y`: never let the page scroll while swiping sideways.
  const touchmove = (e: TouchEvent) => active && e.cancelable && e.preventDefault();

  node.addEventListener('pointerdown', down);
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerup', up);
  node.addEventListener('pointercancel', cancel);
  node.addEventListener('touchmove', touchmove, { passive: false });

  return {
    update(next) {
      h = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
      node.removeEventListener('pointercancel', cancel);
      node.removeEventListener('touchmove', touchmove);
    },
  };
};
