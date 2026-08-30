import { CollectionKind } from '../../../core/models/collection.model';

/** Everything `<app-collection-card>` needs to render — no domain logic. */
export interface CollectionCardVm {
  readonly id: string;
  readonly name: string;
  readonly kind: CollectionKind;
  readonly kindLabel: string;
  /** 0–1, fed straight to `<ion-progress-bar [value]>`. */
  readonly progressRatio: number;
  readonly progressPercentLabel: string;
  readonly progressCountLabel: string;
  /** Ready-to-use CSS value for the cover gradient. */
  readonly accent: string;
  readonly isFavorite: boolean;
}
