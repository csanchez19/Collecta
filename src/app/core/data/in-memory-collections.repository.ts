import { Injectable, inject } from '@angular/core';

import { Collection } from '../models/collection.model';
import { CollectionsRepository } from './collections.repository';
import { simulateLatency } from './mock/latency';
import { MockCatalogDb } from './mock/mock-catalog.db';

/** Offline mock backed by `MockCatalogDb`. Bind it in `core.providers.ts` to work without the API. */
@Injectable()
export class InMemoryCollectionsRepository extends CollectionsRepository {
  private readonly db = inject(MockCatalogDb);

  async list(): Promise<readonly Collection[]> {
    await simulateLatency();
    return this.db.collections();
  }

  async getById(id: string): Promise<Collection | undefined> {
    await simulateLatency();
    return this.db.collections().find((collection) => collection.id === id);
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    await simulateLatency();
    this.db.setFavorite(id, favorite);
  }
}
