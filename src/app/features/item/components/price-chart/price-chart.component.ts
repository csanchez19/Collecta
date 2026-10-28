import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const WIDTH = 300;
const HEIGHT = 86;
const PADDING = 8;

/** Line chart of a price series, stretched to its container. */
@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceChartComponent {
  readonly values = input.required<readonly number[]>();
  readonly trend = input<'up' | 'down'>('up');
  /** Spoken summary, e.g. "de 102 € a 115 €". */
  readonly summary = input.required<string>();

  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
  protected readonly gridLines = `M0 ${HEIGHT / 4}H${WIDTH}M0 ${HEIGHT / 2}H${WIDTH}M0 ${(HEIGHT * 3) / 4}H${WIDTH}`;

  private readonly points = computed(() => {
    const values = this.values();
    if (values.length < 2) {
      return [];
    }
    const min = Math.min(...values);
    const span = Math.max(...values) - min || 1;
    return values.map((value, index) => ({
      x: (index / (values.length - 1)) * WIDTH,
      y: PADDING + (1 - (value - min) / span) * (HEIGHT - PADDING * 2),
    }));
  });

  protected readonly line = computed(() =>
    this.points()
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(' '),
  );

  protected readonly area = computed(() => (this.line() ? `${this.line()} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z` : ''));

  /** Where the last point sits, in % of the box, for the end marker. */
  protected readonly endTop = computed(() => {
    const last = this.points().at(-1);
    return last ? (last.y / HEIGHT) * 100 : 50;
  });
}
