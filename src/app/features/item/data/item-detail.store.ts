import { Injectable, computed, inject, signal } from '@angular/core';

import { CatalogRepository } from '../../../core/data/catalog.repository';
import { CatalogItem, PricePoint, PriceRange } from '../../../core/models/catalog-item.model';
import { CollectionSet } from '../../../core/models/collection-set.model';
import { Loadable } from '../../../core/state/loadable';
import { ProfileStore } from '../../../core/state/profile.store';

const RELATED_COUNT = 3;

/**
 * One catalog item: details, price history, neighbours in its set and the
 * user's copies of it. Provided by the page. Ownership changes are optimistic
 * and roll back if the API rejects them.
 */
@Injectable()
export class ItemDetailStore {
  private readonly catalog = inject(CatalogRepository);
  private readonly profile = inject(ProfileStore);
  private itemId: string | null = null;

  /** `null` once loaded means the item does not exist. */
  readonly item = new Loadable<CatalogItem | null>();
  readonly set = new Loadable<CollectionSet | null>();
  readonly siblings = new Loadable<readonly CatalogItem[]>();
  readonly history = new Loadable<readonly PricePoint[]>();

  private readonly _range = signal<PriceRange>('30d');
  private readonly _saveFailed = signal(false);

  readonly range = this._range.asReadonly();
  readonly saveFailed = this._saveFailed.asReadonly();

  /** Neighbours of the item in album order, without the item itself. */
  readonly related = computed<readonly CatalogItem[]>(() => {
    const items = this.siblings.value() ?? [];
    const index = items.findIndex((item) => item.id === this.itemId);
    const start = Math.max(0, Math.min(index - 1, items.length - RELATED_COUNT - 1));
    return items
      .slice(start, start + RELATED_COUNT + 1)
      .filter((item) => item.id !== this.itemId)
      .slice(0, RELATED_COUNT);
  });

  async load(itemId: string): Promise<void> {
    if (itemId !== this.itemId) {
      this.itemId = itemId;
      this.item.reset();
      this.set.reset();
      this.siblings.reset();
      this.history.reset();
    }
    await this.item.load(async () => (await this.catalog.getItem(itemId)) ?? null);
    const item = this.item.value();
    if (item && this.itemId === itemId) {
      await Promise.all([
        this.set.load(async () => (await this.catalog.getSet(item.setId)) ?? null),
        this.siblings.load(() => this.catalog.listItems(item.setId)),
        this.loadHistory(),
      ]);
    }
  }

  async refresh(): Promise<void> {
    if (this.itemId) {
      await this.load(this.itemId);
    }
  }

  async setRange(range: PriceRange): Promise<void> {
    this._range.set(range);
    await this.loadHistory();
  }

  async setCopies(copies: number): Promise<void> {
    const item = this.item.value();
    if (!item || copies < 0) {
      return;
    }
    await this.save(
      (current) => ({ ...current, ownedCopies: copies, isWished: copies > 0 ? false : current.isWished }),
      () => this.catalog.setOwnedCopies(item.id, copies),
    );
  }

  async toggleWish(): Promise<void> {
    const item = this.item.value();
    if (!item) {
      return;
    }
    const wished = !item.isWished;
    await this.save(
      (current) => ({ ...current, isWished: wished }),
      () => this.catalog.setWished(item.id, wished),
    );
  }

  private async save(change: (item: CatalogItem) => CatalogItem, persist: () => Promise<void>): Promise<void> {
    const before = this.item.value();
    this._saveFailed.set(false);
    this.item.update((item) => (item ? change(item) : item));
    try {
      await persist();
      void this.profile.refresh();
    } catch {
      this.item.update(() => before ?? null);
      this._saveFailed.set(true);
    }
  }

  private async loadHistory(): Promise<void> {
    const itemId = this.itemId;
    if (itemId) {
      const range = this._range();
      await this.history.load(() => this.catalog.getPriceHistory(itemId, range));
    }
  }
}
