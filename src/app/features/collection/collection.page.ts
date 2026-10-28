import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  NavController,
  RefresherCustomEvent,
  ViewWillEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { albumsOutline, chevronForward, star, starOutline } from 'ionicons/icons';

import { CollectionSet } from '../../core/models/collection-set.model';
import { SessionStore } from '../../core/state/session.store';
import { countWidth, formatEuros, initials, padCount } from '../../shared/format';
import { PageBannerComponent } from '../../shared/ui/page-banner/page-banner.component';
import { SegmentBarComponent } from '../../shared/ui/segment-bar/segment-bar.component';
import { StatTile, StatTilesComponent } from '../../shared/ui/stat-tiles/stat-tiles.component';
import { CollectionDetailStore } from './data/collection-detail.store';

interface SetRowVm {
  readonly id: string;
  readonly name: string;
  readonly meta: string;
  readonly ratio: number;
  readonly ownedLabel: string;
  readonly totalLabel: string;
  readonly wishLabel: string | null;
}

/** A collection and its sets. */
@Component({
  selector: 'app-collection',
  templateUrl: './collection.page.html',
  styleUrls: ['./collection.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CollectionDetailStore],
  imports: [
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    PageBannerComponent,
    SegmentBarComponent,
    StatTilesComponent,
  ],
})
export class CollectionPage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  protected readonly store = inject(CollectionDetailStore);
  protected readonly session = inject(SessionStore);

  /** Route param, bound by `withComponentInputBinding()`. */
  readonly collectionId = input.required<string>();

  protected readonly collection = computed(() => this.store.collection.value());
  protected readonly isFavorite = computed(() =>
    this.session.favoriteCollectionIds().has(this.collectionId()),
  );

  protected readonly tiles = computed<readonly StatTile[]>(() => {
    const collection = this.collection();
    if (!collection) {
      return [];
    }
    const width = countWidth(collection.totalCount);
    return [
      { value: padCount(collection.ownedCount, width), suffix: `/${padCount(collection.totalCount, width)}`, label: 'piezas' },
      { value: formatEuros(collection.ownedValueCents), label: 'lo que tienes' },
      { value: String(collection.setCount), label: collection.setCount === 1 ? 'set' : 'sets' },
    ];
  });

  protected readonly sets = computed<readonly SetRowVm[]>(() =>
    (this.store.sets.value() ?? []).map((set) => toSetRow(set)),
  );

  constructor() {
    addIcons({ albumsOutline, chevronForward, star, starOutline });
    effect(() => {
      const id = this.collectionId();
      untracked(() => void this.store.load(id));
    });
  }

  ionViewWillEnter(): void {
    if (this.store.sets.value()) {
      void this.store.refresh();
    }
  }

  protected back(): void {
    void this.nav.navigateBack('/tabs/colecciones');
  }

  protected toggleFavorite(): void {
    void this.session.toggleFavoriteCollection(this.collectionId());
  }

  protected openSet(setId: string): void {
    void this.nav.navigateForward(['/tabs/colecciones', this.collectionId(), 'set', setId]);
  }

  protected ghost(name: string): string {
    return initials(name);
  }

  protected retry(): void {
    void this.store.refresh();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.store.refresh();
    await event.target.complete();
  }
}

function toSetRow(set: CollectionSet): SetRowVm {
  const width = countWidth(set.totalCount);
  const year = set.releaseDate?.slice(0, 4);
  return {
    id: set.id,
    name: set.name,
    meta: [set.series, year].filter(Boolean).join(' · '),
    ratio: set.totalCount === 0 ? 0 : set.ownedCount / set.totalCount,
    ownedLabel: padCount(set.ownedCount, width),
    totalLabel: padCount(set.totalCount, width),
    wishLabel: set.wishedCount > 0 ? `${set.wishedCount} en deseos` : null,
  };
}
