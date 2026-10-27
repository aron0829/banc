export type SaveResult = { ok: true; version: number } | { ok: false; conflict: boolean };

interface Callbacks {
  onConflict: () => void;
  onError: () => void;
  onSaved: () => void;
}

/** Debounced, versioned saving of one document. */
export class Saver {
  version = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight = false;
  /** There is a change that has not been sent yet. */
  private dirty = false;
  /** Bumped by reset() so answers to requests from before are ignored. */
  private generation = 0;

  constructor(
    private update: (data: unknown, expectedVersion: number) => Promise<SaveResult>,
    private getData: () => unknown,
    private on: Callbacks,
    private delay: number,
    private retryDelay: number,
  ) {}

  get busy(): boolean {
    return this.timer !== null || this.inFlight || this.dirty;
  }

  schedule(): void {
    this.dirty = true;
    this.clearTimer();
    this.timer = setTimeout(() => this.flush(), this.delay);
  }

  /** Sends a pending change right away (app goes to background, logout). */
  async flushNow(): Promise<void> {
    this.clearTimer();
    await this.flush();
  }

  /** Forgets pending changes and the version (user changed). */
  reset(): void {
    this.clearTimer();
    this.dirty = false;
    this.version = 0;
    this.generation++;
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private async flush(): Promise<void> {
    this.timer = null;
    // One request at a time: a second one would carry the same expected version and look like a conflict.
    if (this.inFlight || !this.dirty) return;
    const data = this.getData();
    this.dirty = false;
    if (data == null) return;
    this.inFlight = true;
    const generation = this.generation;
    const res = await this.update(data, this.version);
    this.inFlight = false;
    if (generation !== this.generation) return;
    if (res.ok) {
      this.version = res.version;
      if (this.dirty) await this.flush();
      else this.on.onSaved();
    } else if (res.conflict) {
      this.clearTimer();
      this.dirty = false;
      this.on.onConflict();
    } else {
      this.dirty = true;
      this.on.onError();
      this.timer = setTimeout(() => this.flush(), this.retryDelay);
    }
  }
}
