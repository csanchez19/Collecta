import { Injectable, inject } from '@angular/core';

import { CatalogRepository } from '../../../core/data/catalog.repository';
import { CollectionsRepository } from '../../../core/data/collections.repository';
import { Collection } from '../../../core/models/collection.model';
import { CollectionSet } from '../../../core/models/collection-set.model';
import { Loadable } from '../../../core/state/loadable';

/**
 * One collection and its sets. Provided by the page (one instance per screen
 * in the stack), so opening two collections never mixes their state.
 */
@Injectable()
export class CollectionDetailStore {
  private readonly collections = inject(CollectionsRepository);
  private readonly catalog = inject(CatalogRepository);
  private collectionId: string | null = null;

  /** `null` once loaded means the collection does not exist. */
  readonly collection = new Loadable<Collection | null>();
  readonly sets = new Loadable<readonly CollectionSet[]>();

  async load(collectionId: string): Promise<void> {
    if (collectionId !== this.collectionId) {
      this.collectionId = collectionId;
      this.collection.reset();
      this.sets.reset();
    }
    await Promise.all([
      this.collection.load(async () => (await this.collections.getById(collectionId)) ?? null),
      this.sets.load(() => this.catalog.listSets(collectionId)),
    ]);
  }

  async refresh(): Promise<void> {
    if (this.collectionId) {
      await this.load(this.collectionId);
    }
  }
}
