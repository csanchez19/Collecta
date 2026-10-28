import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';

export type ThumbState = 'owned' | 'wished' | 'missing';

/**
 * A catalog piece at card proportions: always its image when there is one
 * (dimmed and desaturated if you don't own it), else a card silhouette tinted
 * with the collection hue. In the `slot` variant a piece you don't own and that
 * has no image is an empty album pocket showing its number.
 */
@Component({
  selector: 'app-item-thumb',
  templateUrl: './item-thumb.component.html',
  styleUrls: ['./item-thumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
})
export class ItemThumbComponent {
  readonly imageUrl = input<string | null>(null);
  readonly hue = input.required<number>();
  readonly state = input<ThumbState>('owned');
  readonly code = input('');
  readonly copies = input(0);
  readonly variant = input<'card' | 'slot'>('card');

  /** The URLs whose download finished or failed. Keyed by URL so a reused thumb (new page) starts over. */
  private readonly loadedUrl = signal<string | null>(null);
  private readonly failedUrl = signal<string | null>(null);

  protected readonly showsCode = computed(() => this.variant() === 'slot' && this.state() !== 'owned');
  /** A broken image falls back to the number / silhouette instead of an empty box. */
  protected readonly hasImage = computed(() => {
    const url = this.imageUrl();
    return !!url && url !== this.failedUrl();
  });
  /** Until it arrives the thumb shimmers, then the image fades in. */
  protected readonly isLoaded = computed(() => this.loadedUrl() === this.imageUrl());

  protected onLoad(url: string): void {
    this.loadedUrl.set(url);
  }

  protected onError(url: string): void {
    this.failedUrl.set(url);
  }

  constructor() {
    addIcons({ heart });
  }
}
