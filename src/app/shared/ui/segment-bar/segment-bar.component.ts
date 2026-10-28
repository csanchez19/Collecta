import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Progress drawn as slanted segments, like an XP bar. Decorative: pair it with a visible number. */
@Component({
  selector: 'app-segment-bar',
  templateUrl: './segment-bar.component.html',
  styleUrls: ['./segment-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentBarComponent {
  /** 0–1. */
  readonly ratio = input.required<number>();
  readonly segments = input(24);

  protected readonly lit = computed(() => {
    const total = this.segments();
    const lit = Math.round(Math.min(1, Math.max(0, this.ratio())) * total);
    return Array.from({ length: total }, (_, index) => index < lit);
  });
}
