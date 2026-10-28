import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline, heart } from 'ionicons/icons';

import { SegmentBarComponent } from '../../../../shared/ui/segment-bar/segment-bar.component';
import { LevelPanelVm } from '../../models/level-panel.vm';

/** Home hero: pieces, value, level and XP, with the three headline counters. */
@Component({
  selector: 'app-level-panel',
  templateUrl: './level-panel.component.html',
  styleUrls: ['./level-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, SegmentBarComponent],
})
export class LevelPanelComponent {
  readonly vm = input.required<LevelPanelVm>();

  constructor() {
    addIcons({ gridOutline, heart });
  }
}
