import { Collection, CollectionKind } from '../../../core/models/collection.model';
import { featuredCollection, filterCollections, kindCounts } from './explore-filters';

function collection(name: string, kind: CollectionKind, popularity: number, totalCount = 10): Collection {
  return {
    id: name,
    name,
    kind,
    kindLabel: '',
    ownedCount: 0,
    totalCount,
    setCount: 1,
    ownedValueCents: 0,
    popularity,
    mine: false,
    accentHue: 30,
    isFavorite: false,
  };
}

const catalog = [
  collection('Hot Wheels', 'car', 40),
  collection('Pokémon TCG (EN)', 'card', 70, 23_770),
  collection('Pokémon TCG (ES)', 'card', 70, 15_000),
];

describe('explore filters', () => {
  it('offers "all" plus only the kinds the catalog has', () => {
    expect(kindCounts(catalog)).toEqual([
      { kind: 'all', count: 3 },
      { kind: 'card', count: 2 },
      { kind: 'car', count: 1 },
    ]);
  });

  it('filters by kind and searches ignoring case and accents', () => {
    expect(filterCollections(catalog, 'card', '', 'name').map((c) => c.name)).toEqual([
      'Pokémon TCG (EN)',
      'Pokémon TCG (ES)',
    ]);
    expect(filterCollections(catalog, 'all', 'POKEMON es', 'name')).toHaveLength(0);
    expect(filterCollections(catalog, 'all', 'pokemon tcg (es', 'name').map((c) => c.name)).toEqual([
      'Pokémon TCG (ES)',
    ]);
  });

  it('sorts by popularity, breaking ties by size', () => {
    expect(filterCollections(catalog, 'all', '', 'popular').map((c) => c.name)).toEqual([
      'Pokémon TCG (EN)',
      'Pokémon TCG (ES)',
      'Hot Wheels',
    ]);
  });

  it('features the most collected collection', () => {
    expect(featuredCollection(catalog)?.name).toBe('Pokémon TCG (EN)');
    expect(featuredCollection([])).toBeUndefined();
  });
});
