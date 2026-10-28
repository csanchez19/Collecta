import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular';

export interface StatTile {
  readonly value: string;
  /** Dimmed suffix after the value, e.g. "/165". */
  readonly suffix?: string;
  readonly label: string;
  readonly tone?: 'wish';
}

/** Row of chamfered counters. Pass `loading` to show their skeletons. */
@Component({
  selector: 'app-stat-tiles',
  templateUrl: './stat-tiles.component.html',
  styleUrls: ['./stat-tiles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonSkeletonText],
})
export class StatTilesComponent {
  readonly tiles = input<readonly StatTile[]>([]);
  readonly loading = input(false);
  readonly label = input.required<string>();

  protected readonly placeholders = [1, 2, 3];
}
