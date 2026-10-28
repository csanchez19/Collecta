import { CatalogItem, PricePoint, PriceRange } from '../models/catalog-item.model';
import { CollectionSet } from '../models/collection-set.model';

/**
 * Boundary for sets, their items and the user's ownership of each item.
 * Bound to a concrete source in `core.providers.ts`.
 */
export abstract class CatalogRepository {
  abstract listSets(collectionId: string): Promise<readonly CollectionSet[]>;
  abstract getSet(setId: string): Promise<CollectionSet | undefined>;
  /** Items of a set ordered by `code` — the order of an album page. */
  abstract listItems(setId: string): Promise<readonly CatalogItem[]>;
  abstract getItem(itemId: string): Promise<CatalogItem | undefined>;
  abstract getPriceHistory(itemId: string, range: PriceRange): Promise<readonly PricePoint[]>;
  /** 0 removes the item from the collection. */
  abstract setOwnedCopies(itemId: string, copies: number): Promise<void>;
  abstract setWished(itemId: string, wished: boolean): Promise<void>;
}
