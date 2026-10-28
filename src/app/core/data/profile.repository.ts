import { CatalogItem } from '../models/catalog-item.model';
import { Progression } from '../models/progression.model';

/** Boundary for the signed-in user's activity: level, recent additions, wishlist. */
export abstract class ProfileRepository {
  abstract getProgression(): Promise<Progression>;
  /** Most recently added first. */
  abstract listRecentlyAdded(limit: number): Promise<readonly CatalogItem[]>;
  abstract listWishlist(): Promise<readonly CatalogItem[]>;
}
