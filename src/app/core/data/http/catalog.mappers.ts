import { CatalogItem, ItemAttribute } from '../../models/catalog-item.model';
import { CollectionSet } from '../../models/collection-set.model';
import { ItemDto, SetDto } from './catalog.dtos';

export function toCollectionSet(dto: SetDto): CollectionSet {
  return {
    id: dto.id,
    collectionId: dto.collectionId,
    name: dto.name,
    series: dto.series,
    releaseDate: dto.releaseDate,
    totalCount: dto.totalCount,
    ownedCount: dto.ownedCount,
    wishedCount: dto.wishedCount,
    ownedValueCents: dto.ownedValueCents,
  };
}

export function toCatalogItem(dto: ItemDto): CatalogItem {
  return {
    id: dto.id,
    setId: dto.setId,
    collectionId: dto.collectionId,
    name: dto.name,
    code: dto.code ?? '',
    rarity: dto.rarity,
    rarityTier: dto.rarityTier,
    imageUrl: dto.imageUrl,
    thumbnailUrl: dto.thumbnailUrl,
    marketValueCents: dto.marketValueCents,
    priceChangePct: dto.priceChangePct,
    attributes: toAttributes(dto.attributes),
    setName: dto.setName,
    accentHue: dto.accentHue,
    ownedCopies: dto.ownedCopies,
    isWished: dto.isWished,
  };
}

/*
 * The API keeps attributes as the source imported them (TCGdex, in English).
 * Known keys get a Spanish label and value, in a fixed order; unknown keys
 * (other sources, hand-made items) still show, with their key as the label.
 */

interface AttributeRule {
  readonly key: string;
  readonly label: string;
  readonly value?: (raw: string) => string;
}

const TYPES: Readonly<Record<string, string>> = {
  Colorless: 'Incoloro',
  Darkness: 'Oscuridad',
  Dragon: 'Dragón',
  Fairy: 'Hada',
  Fighting: 'Lucha',
  Fire: 'Fuego',
  Grass: 'Planta',
  Lightning: 'Rayo',
  Metal: 'Metálico',
  Psychic: 'Psíquico',
  Water: 'Agua',
};

const STAGES: Readonly<Record<string, string>> = {
  Basic: 'Básico',
  Stage1: 'Fase 1',
  Stage2: 'Fase 2',
  Restored: 'Restaurado',
};

const CATEGORIES: Readonly<Record<string, string>> = {
  Pokemon: 'Pokémon',
  Trainer: 'Entrenador',
  Energy: 'Energía',
};

const TRAINER_TYPES: Readonly<Record<string, string>> = {
  Item: 'Objeto',
  Supporter: 'Partidario',
  Stadium: 'Estadio',
  Tool: 'Herramienta',
};

const ENERGY_TYPES: Readonly<Record<string, string>> = {
  Normal: 'Básica',
  Special: 'Especial',
};

const translate = (table: Readonly<Record<string, string>>) => (raw: string) => table[raw] ?? raw;

const RULES: readonly AttributeRule[] = [
  { key: 'hp', label: 'PS' },
  { key: 'types', label: 'Tipo', value: translate(TYPES) },
  { key: 'stage', label: 'Fase', value: translate(STAGES) },
  { key: 'category', label: 'Categoría', value: translate(CATEGORIES) },
  { key: 'trainerType', label: 'Tipo de entrenador', value: translate(TRAINER_TYPES) },
  { key: 'energyType', label: 'Energía', value: translate(ENERGY_TYPES) },
  { key: 'evolveFrom', label: 'Evoluciona de' },
  { key: 'illustrator', label: 'Ilustrador' },
];

/** Shown elsewhere or not useful as a tile. */
const HIDDEN = new Set(['dexId', 'suffix', 'regulationMark']);

export function toAttributes(raw: Readonly<Record<string, unknown>> | null): readonly ItemAttribute[] {
  if (!raw) {
    return [];
  }
  // A Pokémon card always says it is a Pokémon: only show the category for trainers and energies.
  const hidden = new Set(HIDDEN);
  if (raw['category'] === 'Pokemon') {
    hidden.add('category');
  }

  const known = RULES.filter((rule) => !hidden.has(rule.key) && present(raw[rule.key])).map((rule) => ({
    label: rule.label,
    value: format(raw[rule.key], rule.value),
  }));
  const knownKeys = new Set(RULES.map((rule) => rule.key));
  const others = Object.entries(raw)
    .filter(([key, value]) => !knownKeys.has(key) && !hidden.has(key) && present(value))
    .map(([key, value]) => ({ label: key.charAt(0).toUpperCase() + key.slice(1), value: format(value) }));

  return [...known, ...others];
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
}

function format(value: unknown, translateOne: (raw: string) => string = (raw) => raw): string {
  return Array.isArray(value) ? value.map((part) => translateOne(String(part))).join(' · ') : translateOne(String(value));
}
