/** 0 = no rarity shown, 3 = top tier. Drives the diamond marks next to an item. */
export type RarityTier = 0 | 1 | 2 | 3;

/** Kind-specific detail shown on the item sheet ("Tipo: Fuego", "Escala: 1:64"…). */
export interface ItemAttribute {
  readonly label: string;
  readonly value: string;
}

/** A catalog piece plus what the current user has of it. */
export interface CatalogItem {
  readonly id: string;
  readonly setId: string;
  readonly collectionId: string;
  readonly name: string;
  /** Number inside the set, e.g. "025". */
  readonly code: string;
  readonly rarity: string | null;
  readonly rarityTier: RarityTier;
  readonly imageUrl: string | null;
  readonly thumbnailUrl: string | null;
  /** Market value in euro cents; null when there is no price. */
  readonly marketValueCents: number | null;
  /** Price change over the last 30 days, in %. */
  readonly priceChangePct: number | null;
  readonly attributes: readonly ItemAttribute[];
  /** Denormalised for mixed lists (recent, wishlist) that span collections. */
  readonly setName: string;
  readonly accentHue: number;
  /** Copies the current user owns; 0 = missing. */
  readonly ownedCopies: number;
  readonly isWished: boolean;
}

export type PriceRange = '7d' | '30d' | '1y';

export interface PricePoint {
  /** ISO date (yyyy-mm-dd). */
  readonly date: string;
  readonly valueCents: number;
}
