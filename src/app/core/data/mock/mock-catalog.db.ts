import { Injectable } from '@angular/core';

import {
  CatalogItem,
  ItemAttribute,
  PricePoint,
  PriceRange,
  RarityTier,
} from '../../models/catalog-item.model';
import { Collection, CollectionKind } from '../../models/collection.model';
import { CollectionSet } from '../../models/collection-set.model';
import { Achievement, Progression, XP_PER_NEW_ITEM } from '../../models/progression.model';

/*
 * Sample catalog + user state behind the in-memory repositories, so every
 * screen works before Collecta.API serves sets, items and progression. One
 * shared instance keeps ownership consistent across repositories and screens.
 */

interface CollectionSeed {
  readonly id: string;
  readonly name: string;
  readonly kind: CollectionKind;
  readonly kindLabel: string;
  readonly accentHue: number;
  readonly popularity: number;
}

interface SetSeed {
  readonly id: string;
  readonly collectionId: string;
  readonly name: string;
  readonly series: string | null;
  readonly releaseDate: string | null;
}

/** [name, rarity, tier, price in cents, 30-day change %, attributes, copies owned, wished] */
type ItemSeed = readonly [
  string,
  string | null,
  RarityTier,
  number,
  number,
  readonly (readonly [string, string])[],
  number,
  boolean,
];

interface ItemRow {
  readonly id: string;
  readonly setId: string;
  readonly code: string;
  readonly name: string;
  readonly rarity: string | null;
  readonly rarityTier: RarityTier;
  readonly priceCents: number;
  readonly pct: number;
  readonly attributes: readonly ItemAttribute[];
  copies: number;
  wished: boolean;
  addedAt: number;
}

const COLLECTIONS: readonly CollectionSeed[] = [
  { id: 'pokemon', name: 'Pokémon TCG', kind: 'card', kindLabel: 'Cartas coleccionables', accentHue: 30, popularity: 99 },
  { id: 'beyblade', name: 'Beyblade X', kind: 'spinner', kindLabel: 'Peonzas de combate', accentHue: 185, popularity: 74 },
  { id: 'hotwheels', name: 'Hot Wheels', kind: 'car', kindLabel: 'Coches a escala 1:64', accentHue: 255, popularity: 98 },
  { id: 'lego-icons', name: 'LEGO Icons', kind: 'brick', kindLabel: 'Sets de construcción', accentHue: 95, popularity: 69 },
  { id: 'black-series', name: 'Star Wars Black Series', kind: 'figure', kindLabel: 'Figuras de 15 cm', accentHue: 330, popularity: 88 },
];

const SETS: readonly SetSeed[] = [
  { id: 'sv-151', collectionId: 'pokemon', name: '151', series: 'Escarlata y Púrpura', releaseDate: '2023-09-22' },
  { id: 'sv-prismatic', collectionId: 'pokemon', name: 'Evoluciones Prismáticas', series: 'Escarlata y Púrpura', releaseDate: '2025-01-17' },
  { id: 'bx-starters', collectionId: 'beyblade', name: 'Peonzas de inicio', series: 'Beyblade X', releaseDate: '2023-07-15' },
  { id: 'hw-2024', collectionId: 'hotwheels', name: 'Mainline 2024', series: 'Hot Wheels', releaseDate: '2024-01-01' },
  { id: 'hw-japan', collectionId: 'hotwheels', name: 'Japan Historics', series: 'Car Culture', releaseDate: null },
];

const card = (stage: string, type: string) => [['Fase', stage], ['Tipo', type]] as const;
const car = (year: string) => [['Escala', '1:64'], ['Año', year]] as const;
const top = (type: string) => [['Tipo', type], ['Sistema', 'Xtreme']] as const;

const ITEMS: Readonly<Record<string, readonly ItemSeed[]>> = {
  'sv-151': [
    ['Bulbasaur', 'Común', 1, 20, 2, card('Básico', 'Planta'), 1, false],
    ['Ivysaur', 'Poco común', 2, 15, 0, card('Fase 1', 'Planta'), 0, false],
    ['Venusaur ex', 'Doble rara', 3, 480, 5, card('Fase 2', 'Planta'), 2, false],
    ['Charmander', 'Común', 1, 30, 3, card('Básico', 'Fuego'), 1, false],
    ['Charmeleon', 'Poco común', 2, 20, -1, card('Fase 1', 'Fuego'), 0, false],
    ['Charizard ex', 'Doble rara', 3, 950, 12, card('Fase 2', 'Fuego'), 0, true],
    ['Squirtle', 'Común', 1, 25, 1, card('Básico', 'Agua'), 1, false],
    ['Wartortle', 'Poco común', 2, 15, 0, card('Fase 1', 'Agua'), 0, false],
    ['Blastoise ex', 'Doble rara', 3, 240, -4, card('Fase 2', 'Agua'), 0, true],
    ['Caterpie', 'Común', 1, 10, 0, card('Básico', 'Planta'), 1, false],
    ['Metapod', 'Común', 1, 10, 0, card('Fase 1', 'Planta'), 1, false],
    ['Butterfree', 'Rara', 2, 60, 2, card('Fase 2', 'Planta'), 0, false],
    ['Weedle', 'Común', 1, 10, 0, card('Básico', 'Planta'), 1, false],
    ['Kakuna', 'Común', 1, 10, 0, card('Fase 1', 'Planta'), 1, false],
    ['Beedrill', 'Rara', 2, 50, -2, card('Fase 2', 'Planta'), 1, false],
    ['Pidgey', 'Común', 1, 10, 0, card('Básico', 'Incoloro'), 1, false],
    ['Pidgeotto', 'Común', 1, 10, 0, card('Fase 1', 'Incoloro'), 1, false],
    ['Pidgeot', 'Rara', 2, 45, 1, card('Fase 2', 'Incoloro'), 1, false],
    ['Rattata', 'Común', 1, 10, 0, card('Básico', 'Incoloro'), 3, false],
    ['Raticate', 'Poco común', 2, 15, 0, card('Fase 1', 'Incoloro'), 0, false],
    ['Spearow', 'Común', 1, 10, 0, card('Básico', 'Incoloro'), 0, false],
    ['Fearow', 'Poco común', 2, 15, 0, card('Fase 1', 'Incoloro'), 0, false],
    ['Ekans', 'Común', 1, 10, 0, card('Básico', 'Oscuridad'), 1, false],
    ['Arbok', 'Poco común', 2, 20, 0, card('Fase 1', 'Oscuridad'), 0, false],
    ['Pikachu', 'Común', 1, 40, 6, card('Básico', 'Rayo'), 1, false],
    ['Raichu', 'Rara', 2, 60, 2, card('Fase 1', 'Rayo'), 0, false],
    ['Sandshrew', 'Común', 1, 10, 0, card('Básico', 'Lucha'), 0, false],
  ],
  'sv-prismatic': [
    ['Eevee', 'Común', 1, 30, 4, card('Básico', 'Incoloro'), 1, false],
    ['Vaporeon', 'Rara', 2, 80, 1, card('Fase 1', 'Agua'), 0, false],
    ['Jolteon', 'Rara', 2, 80, 0, card('Fase 1', 'Rayo'), 1, false],
    ['Flareon', 'Rara', 2, 80, -2, card('Fase 1', 'Fuego'), 0, false],
    ['Espeon', 'Rara', 2, 90, 3, card('Fase 1', 'Psíquico'), 0, true],
    ['Umbreon', 'Rara', 2, 120, 8, card('Fase 1', 'Oscuridad'), 0, false],
    ['Leafeon', 'Rara', 2, 70, 0, card('Fase 1', 'Planta'), 0, false],
    ['Glaceon', 'Rara', 2, 70, 0, card('Fase 1', 'Agua'), 0, false],
    ['Sylveon', 'Rara', 2, 90, 2, card('Fase 1', 'Psíquico'), 1, false],
  ],
  'bx-starters': [
    ['Dran Sword', null, 0, 1800, 3, top('Ataque'), 1, false],
    ['Hells Scythe', null, 0, 1800, 0, top('Equilibrio'), 1, false],
    ['Wizard Arrow', null, 0, 1800, -1, top('Resistencia'), 1, false],
    ['Knight Shield', null, 0, 1800, 0, top('Defensa'), 0, false],
    ['Shark Edge', null, 0, 2200, 4, top('Ataque'), 1, false],
    ['Leon Claw', null, 0, 2000, 0, top('Equilibrio'), 0, false],
    ['Phoenix Wing', null, 0, 2500, 6, top('Ataque'), 0, true],
    ['Dran Dagger', null, 0, 2200, 2, top('Ataque'), 1, false],
    ['Knight Lance', null, 0, 2000, 0, top('Defensa'), 0, false],
  ],
  'hw-2024': [
    ['’71 Datsun 510', 'Super Treasure Hunt', 3, 9500, 9, car('2024'), 0, true],
    ['Nissan Skyline GT-R (BNR34)', 'Treasure Hunt', 2, 1200, 4, car('2024'), 1, false],
    ['Toyota AE86 Sprinter Trueno', 'Básico', 1, 300, 0, car('2024'), 1, false],
    ['Mazda RX-7 FD', 'Básico', 1, 250, 0, car('2024'), 0, false],
    ['Honda Civic Type R', 'Básico', 1, 200, 0, car('2024'), 2, false],
    ['Nissan Silvia (S15)', 'Básico', 1, 200, 0, car('2024'), 0, false],
    ['Toyota GR Supra', 'Básico', 1, 250, 1, car('2024'), 1, false],
    ['Mitsubishi Lancer Evolution VI', 'Básico', 1, 200, 0, car('2024'), 0, false],
    ['Subaru WRX STI', 'Básico', 1, 200, 0, car('2024'), 1, false],
    ['Porsche 911 GT3 RS', 'Treasure Hunt', 2, 900, 3, car('2024'), 0, false],
    ['Ford Mustang Boss 302', 'Básico', 1, 200, 0, car('2024'), 1, false],
    ['’67 Chevrolet Camaro', 'Básico', 1, 200, -1, car('2024'), 0, false],
  ],
  'hw-japan': [
    ['Nissan Skyline 2000 GT-R', 'Premium', 2, 1400, 2, car('2023'), 1, false],
    ['Toyota 2000GT', 'Premium', 2, 1600, 5, car('2023'), 0, false],
    ['Datsun 240Z', 'Premium', 2, 1300, 0, car('2023'), 1, false],
    ['Mazda Cosmo Sport', 'Premium', 2, 1200, 0, car('2023'), 0, false],
    ['Honda S800', 'Premium', 2, 1100, -2, car('2023'), 0, false],
  ],
};

/** Past activity of the sample account, on top of XP from the items it owns. */
const BASE_XP = 600;
const XP_LEVEL_SIZE = 250;
const BINDER_PAGE_SIZE = 9;

@Injectable({ providedIn: 'root' })
export class MockCatalogDb {
  private readonly rows = new Map<string, ItemRow>();
  private readonly favorites = new Set<string>(['pokemon']);
  private clock = 0;

  constructor() {
    let index = 0;
    for (const [setId, seeds] of Object.entries(ITEMS)) {
      seeds.forEach(([name, rarity, rarityTier, priceCents, pct, attributes, copies, wished], position) => {
        const code = String(position + 1).padStart(3, '0');
        index++;
        this.rows.set(`${setId}-${code}`, {
          id: `${setId}-${code}`,
          setId,
          code,
          name,
          rarity,
          rarityTier,
          priceCents,
          pct,
          attributes: attributes.map(([label, value]) => ({ label, value })),
          copies,
          wished,
          // Deterministic shuffle so "recently added" mixes collections.
          addedAt: copies > 0 ? (index * 7919) % 1000 : 0,
        });
      });
    }
    this.clock = 1000;
  }

  collections(): Collection[] {
    return COLLECTIONS.map((seed) => {
      const sets = SETS.filter((set) => set.collectionId === seed.id);
      const rows = sets.flatMap((set) => this.rowsOf(set.id));
      const owned = rows.filter((row) => row.copies > 0);
      return {
        id: seed.id,
        name: seed.name,
        kind: seed.kind,
        kindLabel: seed.kindLabel,
        accentHue: seed.accentHue,
        popularity: seed.popularity,
        setCount: sets.length,
        totalCount: rows.length,
        ownedCount: owned.length,
        ownedValueCents: valueOf(owned),
        mine: owned.length > 0,
        isFavorite: this.favorites.has(seed.id),
      };
    });
  }

  setFavorite(collectionId: string, favorite: boolean): void {
    if (favorite) {
      this.favorites.add(collectionId);
    } else {
      this.favorites.delete(collectionId);
    }
  }

  sets(collectionId: string): CollectionSet[] {
    return SETS.filter((set) => set.collectionId === collectionId).map((set) => this.toSet(set));
  }

  set(setId: string): CollectionSet | undefined {
    const seed = SETS.find((set) => set.id === setId);
    return seed ? this.toSet(seed) : undefined;
  }

  items(setId: string): CatalogItem[] {
    return this.rowsOf(setId).map((row) => this.toItem(row));
  }

  item(itemId: string): CatalogItem | undefined {
    const row = this.rows.get(itemId);
    return row ? this.toItem(row) : undefined;
  }

  priceHistory(itemId: string, range: PriceRange): PricePoint[] {
    const row = this.rows.get(itemId);
    if (!row) {
      return [];
    }
    const { points, stepDays, scale } = RANGES[range];
    const start = row.priceCents / (1 + (row.pct * scale) / 100);
    const seed = hash(itemId + range);
    const today = Date.now();
    return Array.from({ length: points }, (_, i) => {
      const t = i / (points - 1);
      const wobble = i === points - 1 ? 0 : Math.sin(seed + i * 1.7) * 0.025;
      return {
        date: new Date(today - (points - 1 - i) * stepDays * 86_400_000).toISOString().slice(0, 10),
        valueCents: Math.round((start + (row.priceCents - start) * t) * (1 + wobble)),
      };
    });
  }

  setOwnedCopies(itemId: string, copies: number): void {
    const row = this.rows.get(itemId);
    if (!row) {
      return;
    }
    if (row.copies === 0 && copies > 0) {
      row.addedAt = ++this.clock;
      row.wished = false;
    }
    row.copies = Math.max(0, copies);
  }

  setWished(itemId: string, wished: boolean): void {
    const row = this.rows.get(itemId);
    if (row) {
      row.wished = wished;
    }
  }

  recent(limit: number): CatalogItem[] {
    return [...this.rows.values()]
      .filter((row) => row.copies > 0)
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, limit)
      .map((row) => this.toItem(row));
  }

  wishlist(): CatalogItem[] {
    return [...this.rows.values()]
      .filter((row) => row.wished && row.copies === 0)
      .sort((a, b) => b.priceCents - a.priceCents)
      .map((row) => this.toItem(row));
  }

  progression(): Progression {
    const all = [...this.rows.values()];
    const owned = all.filter((row) => row.copies > 0);
    const xp = BASE_XP + owned.length * XP_PER_NEW_ITEM;

    const ownedCollections = new Set(owned.map((row) => this.collectionIdOf(row.setId))).size;
    const setRatios = SETS.map((set) => ratio(this.rowsOf(set.id)));
    const pageRatios = SETS.flatMap((set) => {
      const rows = this.rowsOf(set.id);
      const pages: number[] = [];
      for (let i = 0; i + BINDER_PAGE_SIZE <= rows.length; i += BINDER_PAGE_SIZE) {
        pages.push(ratio(rows.slice(i, i + BINDER_PAGE_SIZE)));
      }
      return pages;
    });

    const achievements: Achievement[] = [
      achievement('first', 'Primera pieza', '1', owned.length >= 1 ? 1 : 0),
      achievement('duplicate', 'Primer repetido', '×2', owned.some((row) => row.copies > 1) ? 1 : 0),
      achievement('three-collections', 'Tres colecciones', '3', ownedCollections / 3),
      achievement('page', 'Página completa', '9/9', Math.max(0, ...pageRatios)),
      achievement('fifty', '50 piezas', '50', owned.length / 50),
      achievement('set', 'Set completo', '1/1', Math.max(0, ...setRatios)),
    ];

    return {
      level: Math.floor(xp / XP_LEVEL_SIZE) + 1,
      xpInLevel: xp % XP_LEVEL_SIZE,
      xpLevelSize: XP_LEVEL_SIZE,
      achievements,
    };
  }

  private rowsOf(setId: string): ItemRow[] {
    return [...this.rows.values()].filter((row) => row.setId === setId);
  }

  private collectionIdOf(setId: string): string {
    return SETS.find((set) => set.id === setId)?.collectionId ?? '';
  }

  private toSet(seed: SetSeed): CollectionSet {
    const rows = this.rowsOf(seed.id);
    const owned = rows.filter((row) => row.copies > 0);
    return {
      id: seed.id,
      collectionId: seed.collectionId,
      name: seed.name,
      series: seed.series,
      releaseDate: seed.releaseDate,
      totalCount: rows.length,
      ownedCount: owned.length,
      wishedCount: rows.filter((row) => row.wished && row.copies === 0).length,
      ownedValueCents: valueOf(owned),
    };
  }

  private toItem(row: ItemRow): CatalogItem {
    const set = SETS.find((s) => s.id === row.setId);
    const collection = COLLECTIONS.find((c) => c.id === set?.collectionId);
    return {
      id: row.id,
      setId: row.setId,
      collectionId: collection?.id ?? '',
      name: row.name,
      code: row.code,
      rarity: row.rarity,
      rarityTier: row.rarityTier,
      imageUrl: null,
      thumbnailUrl: null,
      marketValueCents: row.priceCents,
      priceChangePct: row.pct,
      attributes: row.attributes,
      setName: set?.name ?? '',
      accentHue: collection?.accentHue ?? 30,
      ownedCopies: row.copies,
      isWished: row.wished && row.copies === 0,
    };
  }
}

const RANGES: Readonly<Record<PriceRange, { points: number; stepDays: number; scale: number }>> = {
  '7d': { points: 7, stepDays: 1, scale: 0.3 },
  '30d': { points: 30, stepDays: 1, scale: 1 },
  '1y': { points: 52, stepDays: 7, scale: 2.5 },
};

function valueOf(rows: readonly ItemRow[]): number {
  return rows.reduce((sum, row) => sum + row.priceCents * row.copies, 0);
}

function ratio(rows: readonly ItemRow[]): number {
  return rows.length === 0 ? 0 : rows.filter((row) => row.copies > 0).length / rows.length;
}

function achievement(id: string, name: string, mark: string, progress: number): Achievement {
  const clamped = Math.min(1, progress);
  return { id, name, mark, unlocked: clamped >= 1, progress: clamped };
}

function hash(text: string): number {
  let h = 0;
  for (const char of text) {
    h = (h * 31 + char.charCodeAt(0)) | 0;
  }
  return Math.abs(h % 1000);
}
