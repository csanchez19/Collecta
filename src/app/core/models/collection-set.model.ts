/** A set inside a collection: a Pokémon expansion, a Hot Wheels series… */
export interface CollectionSet {
  readonly id: string;
  readonly collectionId: string;
  readonly name: string;
  /** Larger family the set belongs to, e.g. "Escarlata y Púrpura". */
  readonly series: string | null;
  /** ISO date (yyyy-mm-dd). */
  readonly releaseDate: string | null;
  readonly totalCount: number;
  /** Items the current user owns in this set. */
  readonly ownedCount: number;
  /** Items of this set on the user's wishlist. */
  readonly wishedCount: number;
  /** Market value of what the user owns in this set, in euro cents. */
  readonly ownedValueCents: number;
}
