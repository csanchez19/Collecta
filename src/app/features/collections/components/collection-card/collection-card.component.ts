import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  albumsOutline,
  carSportOutline,
  cubeOutline,
  discOutline,
  personOutline,
  star,
  starOutline,
} from 'ionicons/icons';

import { KIND_ICON } from '../../../../shared/collection-kind';
import { SegmentBarComponent } from '../../../../shared/ui/segment-bar/segment-bar.component';
import { CollectionCardVm } from '../../models/collection-card.vm';

/** Pure presentational card. Emits intent; never navigates or mutates state. */
@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, SegmentBarComponent],
})
export class CollectionCardComponent {
  readonly vm = input.required<CollectionCardVm>();

  readonly open = output<void>();
  readonly favoriteToggle = output<void>();

  protected readonly kindIcon = computed(() => KIND_ICON[this.vm().kind]);

  constructor() {
    addIcons({ albumsOutline, carSportOutline, discOutline, personOutline, cubeOutline, star, starOutline });
  }
}
