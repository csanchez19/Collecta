import { Injectable, computed, inject, signal } from '@angular/core';

import { CatalogRepository } from '../../../core/data/catalog.repository';
import { CollectionsRepository } from '../../../core/data/collections.repository';
import { CatalogItem } from '../../../core/models/catalog-item.model';
import { Collection } from '../../../core/models/collection.model';
import { CollectionSet } from '../../../core/models/collection-set.model';
import { Loadable } from '../../../core/state/loadable';
import { ItemFilter, countByFilter, itemsOnPage, matchesFilter, pageCount } from './set-binder';

const TOP_VALUABLE = 3;

/**
 * One set, its items and the album view state (filter + page). Provided by the
 * page, so each set screen in the stack keeps its own page and filter.
 */
@Injectable()
export class SetDetailStore {
  private readonly catalog = inject(CatalogRepository);
  private readonly collections = inject(CollectionsRepository);
  private ids: { collectionId: string; setId: string } | null = null;

  /** `null` once loaded means it does not exist. */
  readonly set = new Loadable<CollectionSet | null>();
  readonly collection = new Loadable<Collection | null>();
  readonly items = new Loadable<readonly CatalogItem[]>();

  private readonly _filter = signal<ItemFilter>('all');
  private readonly _page = signal(0);

  readonly filter = this._filter.asReadonly();

  readonly counts = computed(() => countByFilter(this.items.value() ?? []));
  readonly filtered = computed(() =>
    (this.items.value() ?? []).filter((item) => matchesFilter(item, this._filter())),
  );
  readonly pageCount = computed(() => pageCount(this.filtered().length));
  /** Clamped, so a refresh that shrinks the list never leaves an empty page. */
  readonly page = computed(() => Math.min(this._page(), this.pageCount() - 1));
  readonly pageItems = computed(() => itemsOnPage(this.filtered(), this.page()));

  readonly topValuable = computed(() =>
    (this.items.value() ?? [])
      .filter((item) => item.marketValueCents !== null)
      .slice()
      .sort((a, b) => (b.marketValueCents ?? 0) - (a.marketValueCents ?? 0))
      .slice(0, TOP_VALUABLE),
  );

  async load(collectionId: string, setId: string): Promise<void> {
    if (this.ids?.setId !== setId) {
      this.set.reset();
      this.items.reset();
      this._filter.set('all');
      this._page.set(0);
    }
    if (this.ids?.collectionId !== collectionId) {
      this.collection.reset();
    }
    this.ids = { collectionId, setId };
    await Promise.all([
      this.set.load(async () => (await this.catalog.getSet(setId)) ?? null),
      this.collection.load(async () => (await this.collections.getById(collectionId)) ?? null),
      this.items.load(() => this.catalog.listItems(setId)),
    ]);
  }

  async refresh(): Promise<void> {
    if (this.ids) {
      await this.load(this.ids.collectionId, this.ids.setId);
    }
  }

  setFilter(filter: ItemFilter): void {
    this._filter.set(filter);
    this._page.set(0);
  }

  nextPage(): void {
    this._page.set(Math.min(this.page() + 1, this.pageCount() - 1));
  }

  previousPage(): void {
    this._page.set(Math.max(this.page() - 1, 0));
  }
}
