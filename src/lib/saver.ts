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
  /** A change came in while a request was in flight. */
  private dirty = false;

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
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.delay);
  }

  private async flush(): Promise<void> {
    this.timer = null;
    // One request at a time: a second one would carry the same expected version and look like a conflict.
    if (this.inFlight) {
      this.dirty = true;
      return;
    }
    this.dirty = false;
    this.inFlight = true;
    const res = await this.update(this.getData(), this.version);
    this.inFlight = false;
    if (res.ok) {
      this.version = res.version;
      if (this.dirty) this.flush();
      else this.on.onSaved();
    } else if (res.conflict) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
      this.dirty = false;
      this.on.onConflict();
    } else {
      this.on.onError();
      this.timer = setTimeout(() => this.flush(), this.retryDelay);
    }
  }
}
