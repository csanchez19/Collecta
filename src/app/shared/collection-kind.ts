import { CollectionKind } from '../core/models/collection.model';

/** Presentation of each collection kind, shared by every screen that lists collections. */

export const KIND_ICON: Readonly<Record<CollectionKind, string>> = {
  car: 'car-sport-outline',
  card: 'albums-outline',
  spinner: 'disc-outline',
  figure: 'person-outline',
  brick: 'cube-outline',
};

/** Filter chip label: the kind as a group ("Cartas", "Coches"…). */
export const KIND_FILTER_LABEL: Readonly<Record<CollectionKind, string>> = {
  card: 'Cartas',
  car: 'Coches',
  spinner: 'Peonzas',
  figure: 'Figuras',
  brick: 'Construcción',
};

const ITEM_NOUN: Readonly<Record<CollectionKind, readonly [string, string]>> = {
  card: ['carta', 'cartas'],
  car: ['coche', 'coches'],
  spinner: ['peonza', 'peonzas'],
  figure: ['figura', 'figuras'],
  brick: ['modelo', 'modelos'],
};

/** "1 carta", "23.770 cartas": the right noun for this kind's pieces. */
export function itemNoun(kind: CollectionKind, count: number): string {
  const [singular, plural] = ITEM_NOUN[kind];
  return count === 1 ? singular : plural;
}
