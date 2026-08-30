import { Collection } from '../models/collection.model';

/**
 * Read boundary for collection data. Components and stores depend on this
 * abstraction only (DIP); the concrete source (in-memory mock today, HTTP
 * against the catalog API later) is bound in `core.providers.ts`.
 */
export abstract class CollectionsRepository {
  abstract list(): Promise<readonly Collection[]>;
  abstract getById(id: string): Promise<Collection | undefined>;
}
