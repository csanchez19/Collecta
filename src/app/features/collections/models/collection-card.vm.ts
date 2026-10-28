import { CollectionKind } from '../../../core/models/collection.model';

/** Everything `<app-collection-card>` needs to render — no domain logic. */
export interface CollectionCardVm {
  readonly id: string;
  readonly name: string;
  readonly kind: CollectionKind;
  readonly kindLabel: string;
  /** Collection hue every tone of the card derives from. */
  readonly hue: number;
  /** Big faint letters behind the banner, e.g. "HW". */
  readonly ghost: string;
  /** 0–1, fed to the segment bar. */
  readonly ratio: number;
  readonly ownedLabel: string;
  readonly totalLabel: string;
  readonly meta: string;
  readonly valueLabel: string;
  readonly isFavorite: boolean;
}
