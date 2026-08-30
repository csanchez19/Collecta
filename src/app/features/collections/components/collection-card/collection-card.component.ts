import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonButton, IonIcon, IonProgressBar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  albumsOutline,
  cubeOutline,
  discOutline,
  personOutline,
  star,
  starOutline,
} from 'ionicons/icons';

import { CollectionKind } from '../../../../core/models/collection.model';
import { CollectionCardVm } from '../../models/collection-card.vm';

const KIND_ICON: Record<CollectionKind, string> = {
  car: 'albums-outline',
  card: 'albums-outline',
  spinner: 'disc-outline',
  figure: 'person-outline',
  brick: 'cube-outline',
};

/** Pure presentational card. Emits intent; never navigates or mutates state. */
@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonIcon, IonProgressBar],
})
export class CollectionCardComponent {
  readonly vm = input.required<CollectionCardVm>();

  readonly open = output<void>();
  readonly favoriteToggle = output<void>();

  protected readonly kindIcon = computed(() => KIND_ICON[this.vm().kind]);

  constructor() {
    addIcons({ albumsOutline, discOutline, personOutline, cubeOutline, star, starOutline });
  }

  protected onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteToggle.emit();
  }
}
