import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { AuthStore } from '../../../core/auth/auth.store';
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
  private readonly auth = inject(AuthStore);

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

  readonly isLoading = computed(() => this._status() === 'loading' || this._status() === 'idle');
  readonly isEmpty = computed(
    () => this._status() === 'ready' && this.visibleCollections().length === 0,
  );
  readonly hasError = computed(() => this._status() === 'error');

  constructor() {
    // Owned counts and favourites are per user: start over whenever the account changes.
    effect(() => {
      const userId = this.auth.userId();
      untracked(() => {
        this._all.set([]);
        this._status.set('idle');
        if (userId) {
          void this.load();
        }
      });
    });
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
    const userId = this.auth.userId();
    try {
      const collections = await this.repository.list();
      if (this.auth.userId() !== userId) {
        return; // Signed out or switched account mid-request: the effect already restarted.
      }
      this._all.set(collections);
      this.session.replaceFavorites(collections.filter((c) => c.isFavorite).map((c) => c.id));
      this._status.set('ready');
    } catch {
      if (this.auth.userId() === userId) {
        this._status.set('error');
      }
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
