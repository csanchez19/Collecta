import { Injectable, inject } from '@angular/core';

import { CatalogItem, PricePoint, PriceRange } from '../models/catalog-item.model';
import { CollectionSet } from '../models/collection-set.model';
import { CatalogRepository } from './catalog.repository';
import { simulateLatency } from './mock/latency';
import { MockCatalogDb } from './mock/mock-catalog.db';

/** Offline catalog backed by `MockCatalogDb` until Collecta.API serves sets and items. */
@Injectable()
export class InMemoryCatalogRepository extends CatalogRepository {
  private readonly db = inject(MockCatalogDb);

  async listSets(collectionId: string): Promise<readonly CollectionSet[]> {
    await simulateLatency();
    return this.db.sets(collectionId);
  }

  async getSet(setId: string): Promise<CollectionSet | undefined> {
    await simulateLatency();
    return this.db.set(setId);
  }

  async listItems(setId: string): Promise<readonly CatalogItem[]> {
    await simulateLatency();
    return this.db.items(setId);
  }

  async getItem(itemId: string): Promise<CatalogItem | undefined> {
    await simulateLatency();
    return this.db.item(itemId);
  }

  async getPriceHistory(itemId: string, range: PriceRange): Promise<readonly PricePoint[]> {
    await simulateLatency();
    return this.db.priceHistory(itemId, range);
  }

  async setOwnedCopies(itemId: string, copies: number): Promise<void> {
    await simulateLatency();
    this.db.setOwnedCopies(itemId, copies);
  }

  async setWished(itemId: string, wished: boolean): Promise<void> {
    await simulateLatency();
    this.db.setWished(itemId, wished);
  }
}
