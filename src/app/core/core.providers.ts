import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { CollectionsRepository } from './data/collections.repository';
import { InMemoryCollectionsRepository } from './data/in-memory-collections.repository';

/**
 * Wiring for the data layer. Swapping the mock for an HTTP implementation is a
 * one-line change here — no consumer touches a concrete class.
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CollectionsRepository, useClass: InMemoryCollectionsRepository },
  ]);
}
