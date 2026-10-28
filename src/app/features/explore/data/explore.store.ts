import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';

import { CatalogRepository } from '../../../core/data/catalog.repository';
import { CollectionSet } from '../../../core/models/collection-set.model';
import { Loadable } from '../../../core/state/loadable';
import { CollectionsStore } from '../../collections/data/collections.store';
import { ExploreSort, KindFilter, featuredCollection, filterCollections, kindCounts } from './explore-filters';

/**
 * State of the Explorar screen: the whole catalog (shared with the home
 * screen through `CollectionsStore`, no second fetch), the active kind filter,
 * search and order, and the featured collection's sets. Root-provided so the
 * filters survive tab switches.
 */
@Injectable({ providedIn: 'root' })
export class ExploreStore {
  private readonly collections = inject(CollectionsStore);
  private readonly catalog = inject(CatalogRepository);
  private featuredSetsFor: string | null = null;

  private readonly _kind = signal<KindFilter>('all');
  private readonly _query = signal('');
  private readonly _sort = signal<ExploreSort>('popular');

  readonly kind = this._kind.asReadonly();
  readonly query = this._query.asReadonly();
  readonly sort = this._sort.asReadonly();

  /** Status of the catalog fetch (shared with the home screen). */
  readonly status = this.collections.catalog;

  private readonly all = computed(() => this.collections.catalog.value() ?? []);

  readonly kinds = computed(() => kindCounts(this.all()));
  readonly visible = computed(() => filterCollections(this.all(), this._kind(), this._query(), this._sort()));
  readonly featured = computed(() => featuredCollection(this.all()));
  /** The featured block only shows while it matches what the user is looking at. */
  readonly showFeatured = computed(() => {
    const featured = this.featured();
    const kind = this._kind();
    return !!featured && this._query().trim() === '' && (kind === 'all' || kind === featured.kind);
  });
  readonly isCatalogEmpty = computed(() => this.collections.catalog.status() === 'ready' && this.all().length === 0);

  /** Sets of the featured collection, newest first (the API's order). */
  readonly featuredSets = new Loadable<readonly CollectionSet[]>();

  constructor() {
    effect(() => {
      const id = this.featured()?.id ?? null;
      untracked(() => {
        if (id !== this.featuredSetsFor) {
          this.featuredSetsFor = id;
          this.featuredSets.reset();
          if (id) {
            void this.featuredSets.load(() => this.catalog.listSets(id));
          }
        }
      });
    });
  }

  setKind(kind: KindFilter): void {
    this._kind.set(kind);
  }

  setQuery(query: string): void {
    this._query.set(query);
  }

  toggleSort(): void {
    this._sort.update((sort) => (sort === 'popular' ? 'name' : 'popular'));
  }

  async refresh(): Promise<void> {
    await this.collections.refresh();
    const id = this.featuredSetsFor;
    if (id) {
      await this.featuredSets.load(() => this.catalog.listSets(id));
    }
  }
}
