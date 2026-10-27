import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Saver, type SaveResult } from './saver';

/** Fake server with optimistic locking; each request resolves only when release() is called. */
function fakeServer() {
  let version = 1;
  let stored: unknown = null;
  const pending: (() => void)[] = [];
  return {
    get version() {
      return version;
    },
    get stored() {
      return stored;
    },
    update(data: unknown, expected: number): Promise<SaveResult> {
      return new Promise((resolve) =>
        pending.push(() => {
          if (expected !== version) return resolve({ ok: false, conflict: true });
          version += 1;
          stored = data;
          resolve({ ok: true, version });
        }),
      );
    },
    async release() {
      pending.shift()?.();
      await vi.advanceTimersByTimeAsync(0);
    },
  };
}

describe('Saver', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does not report a conflict when a change arrives while the previous save is in flight', async () => {
    const server = fakeServer();
    let data = { n: 1 };
    const onConflict = vi.fn();
    const saver = new Saver((d, v) => server.update(d, v), () => data, { onConflict, onError: vi.fn(), onSaved: vi.fn() }, 400, 5000);
    saver.version = 1;

    saver.schedule();
    await vi.advanceTimersByTimeAsync(400); // first save starts, still in flight
    data = { n: 2 };
    saver.schedule();
    await vi.advanceTimersByTimeAsync(400); // second debounce elapses while first is in flight
    await server.release(); // first save completes
    await vi.advanceTimersByTimeAsync(400);
    await server.release(); // second save completes

    expect(onConflict).not.toHaveBeenCalled();
    expect(server.stored).toEqual({ n: 2 });
    expect(saver.version).toBe(3);
    expect(saver.busy).toBe(false);
  });

  it('reports a real conflict when the server version moved on', async () => {
    const server = fakeServer();
    const onConflict = vi.fn();
    const saver = new Saver((d, v) => server.update(d, v), () => ({}), { onConflict, onError: vi.fn(), onSaved: vi.fn() }, 400, 5000);
    saver.version = 0; // stale
    saver.schedule();
    await vi.advanceTimersByTimeAsync(400);
    await server.release();
    expect(onConflict).toHaveBeenCalledOnce();
    expect(saver.busy).toBe(false);
  });

  it('retries after a network error and stays busy until saved', async () => {
    let fail = true;
    const onError = vi.fn();
    const update = vi.fn(async (): Promise<SaveResult> => (fail ? { ok: false, conflict: false } : { ok: true, version: 2 }));
    const saver = new Saver(update, () => ({}), { onConflict: vi.fn(), onError, onSaved: vi.fn() }, 400, 5000);
    saver.version = 1;
    saver.schedule();
    await vi.advanceTimersByTimeAsync(400);
    expect(onError).toHaveBeenCalledOnce();
    expect(saver.busy).toBe(true);
    fail = false;
    await vi.advanceTimersByTimeAsync(5000);
    expect(update).toHaveBeenCalledTimes(2);
    expect(saver.version).toBe(2);
    expect(saver.busy).toBe(false);
  });
});

describe('Saver flushNow / reset', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('flushNow saves a pending change immediately without waiting for the debounce', async () => {
    const update = vi.fn(async (): Promise<SaveResult> => ({ ok: true, version: 2 }));
    const saver = new Saver(update, () => ({ n: 1 }), { onConflict: vi.fn(), onError: vi.fn(), onSaved: vi.fn() }, 400, 5000);
    saver.version = 1;
    saver.schedule();
    await saver.flushNow();
    expect(update).toHaveBeenCalledOnce();
    expect(saver.busy).toBe(false);
  });

  it('reset drops pending saves and retries (e.g. after logout)', async () => {
    const update = vi.fn(async (): Promise<SaveResult> => ({ ok: false, conflict: false }));
    const saver = new Saver(update, () => ({}), { onConflict: vi.fn(), onError: vi.fn(), onSaved: vi.fn() }, 400, 5000);
    saver.version = 3;
    saver.schedule();
    await vi.advanceTimersByTimeAsync(400); // fails, retry scheduled
    saver.reset();
    await vi.advanceTimersByTimeAsync(20000);
    expect(update).toHaveBeenCalledOnce();
    expect(saver.busy).toBe(false);
    expect(saver.version).toBe(0);
  });

  it('never sends a null document', async () => {
    const update = vi.fn(async (): Promise<SaveResult> => ({ ok: true, version: 2 }));
    const saver = new Saver(update, () => null, { onConflict: vi.fn(), onError: vi.fn(), onSaved: vi.fn() }, 400, 5000);
    saver.schedule();
    await vi.advanceTimersByTimeAsync(400);
    expect(update).not.toHaveBeenCalled();
    expect(saver.busy).toBe(false);
  });
});
