import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { RarityTier } from '../../../core/models/catalog-item.model';

/** Rarity as up to three lit diamonds, like loot tiers. Decorative: show the rarity name next to it. */
@Component({
  selector: 'app-rarity-marks',
  templateUrl: './rarity-marks.component.html',
  styleUrls: ['./rarity-marks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RarityMarksComponent {
  readonly tier = input.required<RarityTier>();

  protected readonly marks = computed(() => [1, 2, 3].map((step) => step <= this.tier()));
}
