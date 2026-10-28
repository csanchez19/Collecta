import { Collection, CollectionKind } from '../../../core/models/collection.model';

/** Pure rules of the Explorar screen: kind filter, search and order. */

export type KindFilter = CollectionKind | 'all';
export type ExploreSort = 'popular' | 'name';

export interface KindCount {
  readonly kind: KindFilter;
  readonly count: number;
}

/** "Todas" plus only the kinds the catalog actually has, in a stable order. */
export function kindCounts(collections: readonly Collection[]): readonly KindCount[] {
  const order: readonly CollectionKind[] = ['card', 'car', 'spinner', 'figure', 'brick'];
  const present = order
    .map((kind) => ({ kind, count: collections.filter((c) => c.kind === kind).length }))
    .filter((entry) => entry.count > 0);
  return [{ kind: 'all', count: collections.length }, ...present];
}

export function filterCollections(
  collections: readonly Collection[],
  kind: KindFilter,
  query: string,
  sort: ExploreSort,
): readonly Collection[] {
  const needle = normalize(query);
  return collections
    .filter((c) => (kind === 'all' || c.kind === kind) && (needle === '' || normalize(c.name).includes(needle)))
    .slice()
    .sort(sort === 'popular' ? byPopularity : (a, b) => a.name.localeCompare(b.name, 'es'));
}

/** The most collected collection (ties: the biggest) — the one Explorar features. */
export function featuredCollection(collections: readonly Collection[]): Collection | undefined {
  return collections.slice().sort(byPopularity)[0];
}

function byPopularity(a: Collection, b: Collection): number {
  return b.popularity - a.popularity || b.totalCount - a.totalCount || a.name.localeCompare(b.name, 'es');
}

/** Case- and accent-insensitive: "pokemon" finds "Pokémon". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
