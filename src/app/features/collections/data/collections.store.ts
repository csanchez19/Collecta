import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { AuthStore } from '../../../core/auth/auth.store';
import { CollectionsRepository } from '../../../core/data/collections.repository';
import { Collection } from '../../../core/models/collection.model';
import { Loadable } from '../../../core/state/loadable';
import { SessionStore } from '../../../core/state/session.store';

export type CollectionSort = 'completion' | 'value' | 'name';

export const COLLECTION_SORTS: readonly CollectionSort[] = ['completion', 'value', 'name'];

/**
 * Owns the Colecciones screen state: the loaded catalog and the active sort.
 * Responsibility stops at "which collections, in what order" — turning a
 * `Collection` into card pixels is the page's job.
 *
 * Provided in root so the state (and the catalog fetch) survives tab switches
 * and back-navigation.
 */
@Injectable({ providedIn: 'root' })
export class CollectionsStore {
  private readonly repository = inject(CollectionsRepository);
  private readonly session = inject(SessionStore);
  private readonly auth = inject(AuthStore);

  readonly catalog = new Loadable<readonly Collection[]>();
  private readonly _sort = signal<CollectionSort>('completion');

  readonly sort = this._sort.asReadonly();

  /** The user's collections (owned or starred), in the active order. */
  readonly myCollections = computed<readonly Collection[]>(() => {
    const favorites = this.session.favoriteCollectionIds();
    const mine = (this.catalog.value() ?? []).filter(
      (collection) => collection.mine || favorites.has(collection.id),
    );
    return mine.slice().sort(COMPARERS[this._sort()]);
  });

  readonly totals = computed(() =>
    this.myCollections().reduce(
      (sum, collection) => ({
        owned: sum.owned + collection.ownedCount,
        valueCents: sum.valueCents + collection.ownedValueCents,
        sets: sum.sets + collection.setCount,
      }),
      { owned: 0, valueCents: 0, sets: 0 },
    ),
  );

  constructor() {
    // Owned counts and favourites are per user: start over whenever the account changes.
    effect(() => {
      const userId = this.auth.userId();
      untracked(() => {
        this.catalog.reset();
        if (userId) {
          void this.refresh();
        }
      });
    });
  }

  setSort(sort: CollectionSort): void {
    this._sort.set(sort);
  }

  async refresh(): Promise<void> {
    await this.catalog.load(() => this.repository.list());
    const collections = this.catalog.value();
    if (collections && this.catalog.status() === 'ready') {
      this.session.replaceFavorites(collections.filter((c) => c.isFavorite).map((c) => c.id));
    }
  }
}

const COMPARERS: Readonly<Record<CollectionSort, (a: Collection, b: Collection) => number>> = {
  completion: (a, b) => completion(b) - completion(a),
  value: (a, b) => b.ownedValueCents - a.ownedValueCents,
  name: (a, b) => a.name.localeCompare(b.name, 'es'),
};

function completion(collection: Collection): number {
  return collection.totalCount === 0 ? 0 : collection.ownedCount / collection.totalCount;
}
