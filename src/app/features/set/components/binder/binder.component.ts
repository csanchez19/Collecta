import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronBack, chevronForward } from 'ionicons/icons';

import { ItemThumbComponent } from '../../../../shared/ui/item-thumb/item-thumb.component';
import { BinderSlotVm } from '../../models/binder-slot.vm';

/** Max page markers shown under the page label; long sets show a window around the current page. */
const MAX_DOTS = 7;

/** One 3 × 3 album page with its pager. Emits intent only. */
@Component({
  selector: 'app-binder',
  templateUrl: './binder.component.html',
  styleUrls: ['./binder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, ItemThumbComponent],
})
export class BinderComponent {
  readonly slots = input.required<readonly BinderSlotVm[]>();
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly open = output<string>();

  protected readonly pageLabel = computed(() => `Página ${this.page() + 1} de ${this.pageCount()}`);

  protected readonly dots = computed(() => {
    const count = this.pageCount();
    const shown = Math.min(count, MAX_DOTS);
    const start = Math.min(Math.max(0, this.page() - Math.floor(shown / 2)), count - shown);
    return Array.from({ length: shown }, (_, index) => start + index === this.page());
  });

  constructor() {
    addIcons({ chevronBack, chevronForward });
  }
}
