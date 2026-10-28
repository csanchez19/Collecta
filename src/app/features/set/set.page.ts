import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  NavController,
  RefresherCustomEvent,
  ViewWillEnter,
} from '@ionic/angular';

import { CatalogItem } from '../../core/models/catalog-item.model';
import { countWidth, formatDate, formatEuros, padCount } from '../../shared/format';
import { ItemThumbComponent } from '../../shared/ui/item-thumb/item-thumb.component';
import { PageBannerComponent } from '../../shared/ui/page-banner/page-banner.component';
import { SegmentBarComponent } from '../../shared/ui/segment-bar/segment-bar.component';
import { StatTile, StatTilesComponent } from '../../shared/ui/stat-tiles/stat-tiles.component';
import { BinderComponent } from './components/binder/binder.component';
import { ITEM_FILTERS, ItemFilter, itemsOnPage, milestones, nextMilestone } from './data/set-binder';
import { SetDetailStore } from './data/set-detail.store';
import { BinderSlotVm } from './models/binder-slot.vm';

const FILTER_LABEL: Record<ItemFilter, string> = {
  all: 'Todas',
  owned: 'Tengo',
  missing: 'Faltan',
  wished: 'Deseos',
};

const BAR_SEGMENTS = 30;

/** A set as an album: progress, milestones and its 3 × 3 pages. */
@Component({
  selector: 'app-set',
  templateUrl: './set.page.html',
  styleUrls: ['./set.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SetDetailStore],
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    BinderComponent,
    ItemThumbComponent,
    PageBannerComponent,
    SegmentBarComponent,
    StatTilesComponent,
  ],
})
export class SetPage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  protected readonly store = inject(SetDetailStore);

  /** Route params, bound by `withComponentInputBinding()`. */
  readonly collectionId = input.required<string>();
  readonly setId = input.required<string>();

  protected readonly barSegments = BAR_SEGMENTS;
  protected readonly set = computed(() => this.store.set.value());
  protected readonly hue = computed(() => this.store.collection.value()?.accentHue ?? 30);
  protected readonly backLabel = computed(() => this.store.collection.value()?.name ?? 'Volver');
  protected readonly loaded = computed(() => !!this.set() && !!this.store.items.value());

  protected readonly eyebrow = computed(() => {
    const set = this.set();
    return set ? [set.series, set.releaseDate && formatDate(set.releaseDate)].filter(Boolean).join(' · ') : '';
  });

  /** Owned / total come from the loaded items, so they follow every change on this screen. */
  private readonly progress = computed(() => {
    const counts = this.store.counts();
    return { owned: counts.owned, total: counts.all };
  });

  protected readonly tiles = computed<readonly StatTile[]>(() => {
    const set = this.set();
    const { owned, total } = this.progress();
    if (!set) {
      return [];
    }
    const width = countWidth(total);
    return [
      { value: padCount(owned, width), suffix: `/${padCount(total, width)}`, label: 'piezas' },
      { value: formatEuros(set.ownedValueCents), label: 'lo que tienes' },
      { value: String(this.store.counts().wished), label: 'en deseos', tone: 'wish' },
    ];
  });

  protected readonly ratio = computed(() => {
    const { owned, total } = this.progress();
    return total === 0 ? 0 : owned / total;
  });

  protected readonly milestones = computed(() =>
    milestones(this.progress().owned, this.progress().total).map((milestone) => ({
      ...milestone,
      label: `${milestone.percent} %`,
    })),
  );

  protected readonly nextGoal = computed(() => {
    const next = nextMilestone(this.progress().owned, this.progress().total);
    if (!next) {
      return null;
    }
    const what = next.percent === 100 ? 'el set completo' : `el ${next.percent} % del set`;
    return { missing: next.missing === 1 ? '1 pieza más' : `${next.missing} piezas más`, what };
  });

  protected readonly tabs = computed(() =>
    ITEM_FILTERS.map((filter) => ({
      filter,
      label: FILTER_LABEL[filter],
      count: this.store.counts()[filter],
      active: this.store.filter() === filter,
    })),
  );

  protected readonly slots = computed<readonly BinderSlotVm[]>(() =>
    this.store.pageItems().map((item) => toSlot(item, this.hue())),
  );

  protected readonly top = computed(() =>
    this.store.topValuable().map((item, index) => ({
      id: item.id,
      rank: padCount(index + 1, 2),
      name: `${item.name} · ${item.code}`,
      hue: this.hue(),
      imageUrl: item.thumbnailUrl ?? item.imageUrl,
      state: item.ownedCopies > 0 ? 'La tienes' : item.isWished ? 'En deseos' : 'Te falta',
      tone: item.ownedCopies > 0 ? 'owned' : item.isWished ? 'wish' : 'missing',
      price: formatEuros(item.marketValueCents ?? 0, true),
    })),
  );

  constructor() {
    effect(() => {
      const collectionId = this.collectionId();
      const setId = this.setId();
      untracked(() => void this.store.load(collectionId, setId));
    });

    // Warm the browser cache with the neighbouring pages' images, so a page turn shows them at once.
    effect(() => {
      const page = this.store.page();
      const items = this.store.filtered();
      untracked(() => {
        for (const item of [...itemsOnPage(items, page - 1), ...itemsOnPage(items, page + 1)]) {
          const url = item.thumbnailUrl ?? item.imageUrl;
          if (url) {
            new Image().src = url;
          }
        }
      });
    });
  }

  ionViewWillEnter(): void {
    if (this.store.items.value()) {
      void this.store.refresh();
    }
  }

  protected back(): void {
    void this.nav.navigateBack(['/tabs/colecciones', this.collectionId()]);
  }

  protected setFilter(filter: ItemFilter): void {
    this.store.setFilter(filter);
  }

  protected openItem(itemId: string): void {
    void this.nav.navigateForward(['/tabs/colecciones', this.collectionId(), 'objeto', itemId]);
  }

  protected retry(): void {
    void this.store.refresh();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.store.refresh();
    await event.target.complete();
  }
}

function toSlot(item: CatalogItem, hue: number): BinderSlotVm {
  const state = item.ownedCopies > 0 ? 'owned' : item.isWished ? 'wished' : 'missing';
  const status = { owned: 'la tienes', wished: 'en tus deseos', missing: 'te falta' }[state];
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    hue,
    imageUrl: item.thumbnailUrl ?? item.imageUrl,
    state,
    copies: item.ownedCopies,
    ariaLabel: `${item.name}, número ${item.code}, ${status}`,
  };
}
