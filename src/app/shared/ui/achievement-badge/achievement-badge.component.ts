import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosed } from 'ionicons/icons';

import { Achievement } from '../../../core/models/progression.model';

/** Hexagonal achievement badge: gold when unlocked, grey with a progress line when not. */
@Component({
  selector: 'app-achievement-badge',
  templateUrl: './achievement-badge.component.html',
  styleUrls: ['./achievement-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class AchievementBadgeComponent {
  readonly achievement = input.required<Achievement>();

  protected readonly progressPercent = computed(() => Math.round(this.achievement().progress * 100));

  constructor() {
    addIcons({ lockClosed });
  }
}
