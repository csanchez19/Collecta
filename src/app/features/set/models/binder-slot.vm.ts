import { ThumbState } from '../../../shared/ui/item-thumb/item-thumb.component';

/** One pocket of the album page — no domain logic. */
export interface BinderSlotVm {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly hue: number;
  readonly imageUrl: string | null;
  readonly state: ThumbState;
  readonly copies: number;
  /** Full sentence for screen readers: name, number and whether you have it. */
  readonly ariaLabel: string;
}
