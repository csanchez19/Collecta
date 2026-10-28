import { Collection } from '../models/collection.model';

/**
 * Boundary for collection data. Components and stores depend on this
 * abstraction only (DIP); the concrete source (HTTP against Collecta.API) is
 * bound in `core.providers.ts`.
 */
export abstract class CollectionsRepository {
  abstract list(): Promise<readonly Collection[]>;
  abstract getById(id: string): Promise<Collection | undefined>;
  abstract setFavorite(id: string, favorite: boolean): Promise<void>;
}
