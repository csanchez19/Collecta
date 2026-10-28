import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';

export type ThumbState = 'owned' | 'wished' | 'missing';

/**
 * A catalog piece at card proportions: its image, or a card silhouette tinted
 * with the collection hue while there is none. In the `slot` variant a piece
 * you don't own is an empty album pocket showing its number.
 */
@Component({
  selector: 'app-item-thumb',
  templateUrl: './item-thumb.component.html',
  styleUrls: ['./item-thumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class ItemThumbComponent {
  readonly imageUrl = input<string | null>(null);
  readonly hue = input.required<number>();
  readonly state = input<ThumbState>('owned');
  readonly code = input('');
  readonly copies = input(0);
  readonly variant = input<'card' | 'slot'>('card');

  protected readonly showsCode = computed(() => this.variant() === 'slot' && this.state() !== 'owned');

  constructor() {
    addIcons({ heart });
  }
}
