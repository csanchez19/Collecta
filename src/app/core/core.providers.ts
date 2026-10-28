import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { CatalogRepository } from './data/catalog.repository';
import { CollectionsRepository } from './data/collections.repository';
import { HttpCatalogRepository } from './data/http-catalog.repository';
import { HttpCollectionsRepository } from './data/http-collections.repository';
import { HttpProfileRepository } from './data/http-profile.repository';
import { ProfileRepository } from './data/profile.repository';

/** Wiring for the data layer — no consumer touches a concrete class. */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: CollectionsRepository, useClass: HttpCollectionsRepository },
    { provide: CatalogRepository, useClass: HttpCatalogRepository },
    { provide: ProfileRepository, useClass: HttpProfileRepository },
  ]);
}
