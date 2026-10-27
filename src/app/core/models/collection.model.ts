/**
 * A collection theme configured by an administrator (Hot Wheels, Pokémon 151…).
 * Each collection is backed by a per-item catalog exposed through a repository.
 */
export type CollectionKind = 'car' | 'card' | 'spinner' | 'figure' | 'brick';

export interface Collection {
  readonly id: string;
  readonly name: string;
  readonly kind: CollectionKind;
  /** Human label for the kind, e.g. "Coches a escala 1:64". */
  readonly kindLabel: string;
  /** Items the current user owns in this collection. */
  readonly ownedCount: number;
  /** Total items in the collection catalog. */
  readonly totalCount: number;
  /** 0–100 popularity score used to rank the "Populares" scope. */
  readonly popularity: number;
  /** True when the user already follows / owns items in this collection. */
  readonly mine: boolean;
  /** OKLCH hue (0–360) that drives the card's accent gradient. */
  readonly accentHue: number;
  /** Favourite state when fetched; the live value lives in `SessionStore`. */
  readonly isFavorite: boolean;
}
