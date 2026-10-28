import { RarityTier } from '../../models/catalog-item.model';

/*
 * Shapes Collecta.API returns (Features/Catalog, Features/Me). Mapping to the
 * app's models lives in `catalog.mappers.ts`.
 */

/** `SetResponse`. */
export interface SetDto {
  readonly id: string;
  readonly collectionId: string;
  readonly name: string;
  readonly series: string | null;
  /** yyyy-mm-dd */
  readonly releaseDate: string | null;
  readonly logoUrl: string | null;
  readonly symbolUrl: string | null;
  readonly totalCount: number;
  readonly ownedCount: number;
  readonly wishedCount: number;
  readonly ownedValueCents: number;
}

/** `ItemResponse`. `attributes` is the raw object the importer stored (hp, types, stage… for cards). */
export interface ItemDto {
  readonly id: string;
  readonly setId: string;
  readonly collectionId: string;
  readonly setName: string;
  readonly accentHue: number;
  readonly name: string;
  readonly code: string | null;
  readonly rarity: string | null;
  readonly rarityTier: RarityTier;
  readonly imageUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly marketValueCents: number | null;
  readonly priceChangePct: number | null;
  readonly attributes: Readonly<Record<string, unknown>> | null;
  readonly ownedCopies: number;
  readonly isWished: boolean;
}

/** `PricePointResponse`. */
export interface PricePointDto {
  readonly date: string;
  readonly valueCents: number;
}

/** `ProgressionResponse` (same shape as the app's `Progression`). */
export interface ProgressionDto {
  readonly level: number;
  readonly xpInLevel: number;
  readonly xpLevelSize: number;
  readonly achievements: readonly {
    readonly id: string;
    readonly name: string;
    readonly mark: string;
    readonly unlocked: boolean;
    readonly progress: number;
  }[];
}
