import { Injectable, inject } from '@angular/core';

import { CatalogItem } from '../models/catalog-item.model';
import { Progression } from '../models/progression.model';
import { simulateLatency } from './mock/latency';
import { MockCatalogDb } from './mock/mock-catalog.db';
import { ProfileRepository } from './profile.repository';

/** Offline level / recent / wishlist backed by `MockCatalogDb` until the API has them. */
@Injectable()
export class InMemoryProfileRepository extends ProfileRepository {
  private readonly db = inject(MockCatalogDb);

  async getProgression(): Promise<Progression> {
    await simulateLatency();
    return this.db.progression();
  }

  async listRecentlyAdded(limit: number): Promise<readonly CatalogItem[]> {
    await simulateLatency();
    return this.db.recent(limit);
  }

  async listWishlist(): Promise<readonly CatalogItem[]> {
    await simulateLatency();
    return this.db.wishlist();
  }
}
