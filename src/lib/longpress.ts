import type { Action } from 'svelte/action';

const DELAY = 500;

/** Calls the handler after holding for 500 ms and swallows the click that follows. */
export const longpress: Action<HTMLElement, (() => void) | undefined> = (node, handler) => {
  let current = handler;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let fired = false;
  let start = { x: 0, y: 0 };

  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  const down = (e: PointerEvent) => {
    if (!current) return;
    fired = false;
    start = { x: e.clientX, y: e.clientY };
    timer = setTimeout(() => {
      fired = true;
      timer = null;
      navigator.vibrate?.(15);
      current?.();
    }, DELAY);
  };
  const move = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) cancel();
  };
  const click = (e: MouseEvent) => {
    if (fired) {
      e.stopPropagation();
      e.preventDefault();
      fired = false;
    }
  };
  const menu = (e: Event) => current && e.preventDefault();

  node.addEventListener('pointerdown', down);
  node.addEventListener('pointermove', move);
  node.addEventListener('pointerup', cancel);
  node.addEventListener('pointerleave', cancel);
  node.addEventListener('pointercancel', cancel);
  node.addEventListener('click', click, true);
  node.addEventListener('contextmenu', menu);

  return {
    update(h) {
      current = h;
    },
    destroy() {
      cancel();
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', cancel);
      node.removeEventListener('pointerleave', cancel);
      node.removeEventListener('pointercancel', cancel);
      node.removeEventListener('click', click, true);
      node.removeEventListener('contextmenu', menu);
    },
  };
};
