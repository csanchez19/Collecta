import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, checkmark, remove } from 'ionicons/icons';

/** "Add to my collection", or the copy counter once you own it. Emits intent only. */
@Component({
  selector: 'app-ownership-panel',
  templateUrl: './ownership-panel.component.html',
  styleUrls: ['./ownership-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class OwnershipPanelComponent {
  readonly copies = input.required<number>();
  /** XP the first copy grants, shown on the add button. */
  readonly xpReward = input.required<number>();
  readonly saveFailed = input(false);

  readonly increment = output<void>();
  readonly decrement = output<void>();

  protected readonly copiesLabel = computed(() =>
    this.copies() === 1 ? 'Tienes 1 copia' : `Tienes ${this.copies()} copias`,
  );

  constructor() {
    addIcons({ add, checkmark, remove });
  }
}
