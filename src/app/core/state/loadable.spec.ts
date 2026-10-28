import { Loadable } from './loadable';

describe('Loadable', () => {
  it('is a first load until a value arrives', async () => {
    const loadable = new Loadable<number>();
    expect(loadable.isFirstLoad()).toBe(true);

    await loadable.load(async () => 7);

    expect(loadable.value()).toBe(7);
    expect(loadable.isFirstLoad()).toBe(false);
    expect(loadable.status()).toBe('ready');
  });

  it('keeps the current value visible when a refresh fails', async () => {
    const loadable = new Loadable<number>();
    await loadable.load(async () => 7);

    await loadable.load(async () => {
      throw new Error('offline');
    });

    expect(loadable.value()).toBe(7);
    expect(loadable.hasError()).toBe(false);
    expect(loadable.status()).toBe('error');
  });

  it('reports an error when there is nothing to show', async () => {
    const loadable = new Loadable<number>();

    await loadable.load(async () => {
      throw new Error('offline');
    });

    expect(loadable.hasError()).toBe(true);
    expect(loadable.isFirstLoad()).toBe(false);
  });

  it('drops a response that arrives after a newer load', async () => {
    const loadable = new Loadable<string>();
    let releaseSlow: (value: string) => void = () => undefined;
    const slow = loadable.load(() => new Promise<string>((resolve) => (releaseSlow = resolve)));

    await loadable.load(async () => 'fresh');
    releaseSlow('stale');
    await slow;

    expect(loadable.value()).toBe('fresh');
  });

  it('drops a response that arrives after a reset', async () => {
    const loadable = new Loadable<string>();
    let release: (value: string) => void = () => undefined;
    const pending = loadable.load(() => new Promise<string>((resolve) => (release = resolve)));

    loadable.reset();
    release('stale');
    await pending;

    expect(loadable.value()).toBeUndefined();
    expect(loadable.status()).toBe('idle');
  });
});
