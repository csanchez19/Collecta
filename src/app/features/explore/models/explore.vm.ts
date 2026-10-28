import { CollectionKind } from '../../../core/models/collection.model';

/** One collection in the Explorar list — no domain logic. */
export interface ExploreRowVm {
  readonly id: string;
  readonly name: string;
  readonly kind: CollectionKind;
  readonly hue: number;
  readonly ghost: string;
  /** "220 sets · 23.770 cartas". */
  readonly meta: string;
  /** 0–1 share of users who collect it. */
  readonly popularityRatio: number;
  readonly popularityLabel: string;
  /** "Tienes 52 cartas", or null when the user has none. */
  readonly ownedLabel: string | null;
  readonly isFavorite: boolean;
}

export interface FeaturedSetVm {
  readonly id: string;
  readonly mark: string;
  readonly name: string;
  readonly date: string;
}

/** The highlighted collection at the top of Explorar. */
export interface FeaturedVm {
  readonly id: string;
  readonly name: string;
  readonly kindLabel: string;
  readonly hue: number;
  readonly ghost: string;
  readonly setCount: string;
  readonly itemCount: string;
  readonly itemNoun: string;
  readonly popularity: string;
  readonly ctaLabel: string;
  readonly isFavorite: boolean;
}
