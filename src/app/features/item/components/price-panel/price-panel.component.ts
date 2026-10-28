import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonIcon, IonSkeletonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowDown, arrowUp } from 'ionicons/icons';

import { PriceRange } from '../../../../core/models/catalog-item.model';
import { PriceChartComponent } from '../price-chart/price-chart.component';

export interface PriceVm {
  readonly value: string;
  readonly change: string;
  readonly trend: 'up' | 'down';
  /** Spoken version of the change chip. */
  readonly changeLabel: string;
}

export interface ChartVm {
  readonly values: readonly number[];
  readonly trend: 'up' | 'down';
  readonly summary: string;
}

export const PRICE_RANGES: readonly { range: PriceRange; label: string }[] = [
  { range: '7d', label: '7D' },
  { range: '30d', label: '30D' },
  { range: '1y', label: '1A' },
];

/** Market price, its change and the history chart with a period switch. */
@Component({
  selector: 'app-price-panel',
  templateUrl: './price-panel.component.html',
  styleUrls: ['./price-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonSkeletonText, PriceChartComponent],
})
export class PricePanelComponent {
  /** `null` when the item has no market price. */
  readonly price = input.required<PriceVm | null>();
  /** `null` while the history loads. */
  readonly chart = input.required<ChartVm | null>();
  readonly range = input.required<PriceRange>();

  readonly rangeChange = output<PriceRange>();

  protected readonly ranges = PRICE_RANGES;

  constructor() {
    addIcons({ arrowUp, arrowDown });
  }
}
