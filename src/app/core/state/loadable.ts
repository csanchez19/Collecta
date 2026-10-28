import { Signal, computed, signal } from '@angular/core';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * An async value with the loading semantics every screen shares:
 * - the first load shows skeletons (`isFirstLoad`);
 * - a refresh keeps the current value on screen while it reloads;
 * - an error only replaces the screen when there is nothing to show;
 * - a response that arrives after a newer `load()`/`reset()` is dropped.
 */
export class Loadable<T> {
  private readonly _value = signal<T | undefined>(undefined);
  private readonly _status = signal<LoadStatus>('idle');
  private generation = 0;

  readonly value: Signal<T | undefined> = this._value.asReadonly();
  readonly status: Signal<LoadStatus> = this._status.asReadonly();
  readonly isFirstLoad = computed(() => this._value() === undefined && this._status() !== 'error');
  readonly hasError = computed(() => this._value() === undefined && this._status() === 'error');

  async load(fetch: () => Promise<T>): Promise<void> {
    const generation = ++this.generation;
    this._status.set('loading');
    try {
      const value = await fetch();
      if (generation === this.generation) {
        this._value.set(value);
        this._status.set('ready');
      }
    } catch {
      if (generation === this.generation) {
        this._status.set('error');
      }
    }
  }

  /** Optimistic local change; the next `load()` brings the server's truth. */
  update(change: (value: T) => T): void {
    const current = this._value();
    if (current !== undefined) {
      this._value.set(change(current));
    }
  }

  reset(): void {
    this.generation++;
    this._value.set(undefined);
    this._status.set('idle');
  }
}
