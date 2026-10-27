import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { CollectionsRepository } from './data/collections.repository';
import { HttpCollectionsRepository } from './data/http-collections.repository';

/**
 * Wiring for the data layer. Swap `HttpCollectionsRepository` for
 * `InMemoryCollectionsRepository` here to run without the API — no consumer
 * touches a concrete class.
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CollectionsRepository, useClass: HttpCollectionsRepository },
  ]);
}
