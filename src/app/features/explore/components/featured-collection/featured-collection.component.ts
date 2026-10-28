import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonIcon, IonSkeletonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronForward, star, starOutline } from 'ionicons/icons';

import { FeaturedSetVm, FeaturedVm } from '../../models/explore.vm';

const RECENT_SET_SLOTS = [1, 2, 3, 4];

/** The highlighted collection: its numbers, latest sets and the way in. Emits intent only. */
@Component({
  selector: 'app-featured-collection',
  templateUrl: './featured-collection.component.html',
  styleUrls: ['./featured-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonSkeletonText],
})
export class FeaturedCollectionComponent {
  readonly vm = input.required<FeaturedVm>();
  readonly sets = input<readonly FeaturedSetVm[]>([]);
  readonly setsLoading = input(false);

  readonly open = output<void>();
  readonly openSet = output<string>();
  readonly favoriteToggle = output<void>();

  protected readonly placeholders = RECENT_SET_SLOTS;

  constructor() {
    addIcons({ chevronForward, star, starOutline });
  }
}
