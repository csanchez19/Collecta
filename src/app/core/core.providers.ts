import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { CatalogRepository } from './data/catalog.repository';
import { CollectionsRepository } from './data/collections.repository';
import { InMemoryCatalogRepository } from './data/in-memory-catalog.repository';
import { InMemoryCollectionsRepository } from './data/in-memory-collections.repository';
import { InMemoryProfileRepository } from './data/in-memory-profile.repository';
import { ProfileRepository } from './data/profile.repository';

/**
 * Wiring for the data layer — no consumer touches a concrete class.
 *
 * Everything runs on the in-memory mocks for now: Collecta.API does not serve
 * sets, items or progression yet, and the screens need the three to agree on
 * ids. Swap in `HttpCollectionsRepository` (and HTTP versions of the others)
 * once those endpoints exist.
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CollectionsRepository, useClass: InMemoryCollectionsRepository },
    { provide: CatalogRepository, useClass: InMemoryCatalogRepository },
    { provide: ProfileRepository, useClass: InMemoryProfileRepository },
  ]);
}
