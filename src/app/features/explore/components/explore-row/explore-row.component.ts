import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  albumsOutline,
  carSportOutline,
  checkmark,
  cubeOutline,
  discOutline,
  personOutline,
  star,
  starOutline,
} from 'ionicons/icons';

import { KIND_ICON } from '../../../../shared/collection-kind';
import { SegmentBarComponent } from '../../../../shared/ui/segment-bar/segment-bar.component';
import { ExploreRowVm } from '../../models/explore.vm';

/** One collection of the catalog. Emits intent; never navigates or mutates state. */
@Component({
  selector: 'app-explore-row',
  templateUrl: './explore-row.component.html',
  styleUrls: ['./explore-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, SegmentBarComponent],
})
export class ExploreRowComponent {
  readonly vm = input.required<ExploreRowVm>();

  readonly open = output<void>();
  readonly favoriteToggle = output<void>();

  protected readonly kindIcon = computed(() => KIND_ICON[this.vm().kind]);

  constructor() {
    addIcons({ albumsOutline, carSportOutline, checkmark, cubeOutline, discOutline, personOutline, star, starOutline });
  }
}
