import { Injectable, computed, inject, signal } from '@angular/core';

import { CollectionsRepository } from '../../../core/data/collections.repository';
import { Collection } from '../../../core/models/collection.model';
import { CollectionScope } from '../../../core/models/collection-scope';
import { SessionStore } from '../../../core/state/session.store';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Owns the Colecciones screen state: the loaded catalog plus the active
 * search + scope filters. Responsibility stops at "which collections, in what
 * order" — turning a `Collection` into card pixels is the page's job.
 *
 * Provided in root so the state (and the one catalog fetch) survives tab
 * switches and back-navigation.
 */
@Injectable({ providedIn: 'root' })
export class CollectionsStore {
  private readonly repository = inject(CollectionsRepository);
  private readonly session = inject(SessionStore);

  private readonly _all = signal<readonly Collection[]>([]);
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _query = signal('');
  private readonly _scope = signal<CollectionScope>('mias');

  readonly status = this._status.asReadonly();
  readonly query = this._query.asReadonly();
  readonly scope = this._scope.asReadonly();

  /** Collections matching the active scope + search, ordered for that scope. */
  readonly visibleCollections = computed<readonly Collection[]>(() => {
    const scope = this._scope();
    const needle = this._query().trim().toLowerCase();
    const favorites = this.session.favoriteCollectionIds();

    const filtered = this._all().filter(
      (collection) =>
        this.matchesScope(collection, scope, favorites) &&
        (needle === '' || collection.name.toLowerCase().includes(needle)),
    );

    return scope === 'populares'
      ? filtered.slice().sort((a, b) => b.popularity - a.popularity)
      : filtered;
  });

  readonly isLoading = computed(() => this._status() === 'loading');
  readonly isEmpty = computed(
    () => this._status() === 'ready' && this.visibleCollections().length === 0,
  );
  readonly hasError = computed(() => this._status() === 'error');

  constructor() {
    void this.load();
  }

  setQuery(value: string): void {
    this._query.set(value);
  }

  setScope(scope: CollectionScope): void {
    this._scope.set(scope);
  }

  async reload(): Promise<void> {
    this._status.set('idle');
    await this.load();
  }

  private async load(): Promise<void> {
    if (this._status() === 'loading' || this._status() === 'ready') {
      return;
    }
    this._status.set('loading');
    try {
      this._all.set(await this.repository.list());
      this._status.set('ready');
    } catch {
      this._status.set('error');
    }
  }

  private matchesScope(
    collection: Collection,
    scope: CollectionScope,
    favorites: ReadonlySet<string>,
  ): boolean {
    switch (scope) {
      case 'mias':
        return collection.mine || favorites.has(collection.id);
      case 'sugeridas':
        return !collection.mine;
      case 'populares':
        return true;
    }
  }
}
