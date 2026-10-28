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
import { chevronBack, heart, heartOutline } from 'ionicons/icons';

import { PriceRange } from '../../core/models/catalog-item.model';
import { XP_PER_NEW_ITEM } from '../../core/models/progression.model';
import { countWidth, formatEuros, formatPct, padCount } from '../../shared/format';
import { ItemThumbComponent } from '../../shared/ui/item-thumb/item-thumb.component';
import { RarityMarksComponent } from '../../shared/ui/rarity-marks/rarity-marks.component';
import { OwnershipPanelComponent } from './components/ownership-panel/ownership-panel.component';
import { ChartVm, PricePanelComponent, PriceVm } from './components/price-panel/price-panel.component';
import { ItemDetailStore } from './data/item-detail.store';

/** One catalog item: what it is, what it is worth and how many you have. */
@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ItemDetailStore],
  imports: [
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    ItemThumbComponent,
    OwnershipPanelComponent,
    PricePanelComponent,
    RarityMarksComponent,
  ],
})
export class ItemPage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  protected readonly store = inject(ItemDetailStore);

  /** Route params, bound by `withComponentInputBinding()`. */
  readonly collectionId = input.required<string>();
  readonly itemId = input.required<string>();

  protected readonly xpPerItem = XP_PER_NEW_ITEM;
  protected readonly item = computed(() => this.store.item.value());

  protected readonly backLabel = computed(() => this.item()?.setName ?? 'Volver');

  protected readonly numberLabel = computed(() => {
    const item = this.item();
    const total = this.store.set.value()?.totalCount;
    if (!item) {
      return null;
    }
    return { code: item.code, total: total ? `/${padCount(total, countWidth(total))}` : '' };
  });

  protected readonly price = computed<PriceVm | null>(() => {
    const item = this.item();
    if (!item || item.marketValueCents === null) {
      return null;
    }
    const change = item.priceChangePct ?? 0;
    const trend = change < 0 ? 'down' : 'up';
    return {
      value: formatEuros(item.marketValueCents, true),
      change: formatPct(change),
      trend,
      changeLabel: `${trend === 'down' ? 'Ha bajado' : 'Ha subido'} un ${formatPct(change)} en 30 días`,
    };
  });

  protected readonly chart = computed<ChartVm | null>(() => {
    const points = this.store.history.value() ?? [];
    if (points.length < 2) {
      return null;
    }
    const first = points[0].valueCents;
    const last = points[points.length - 1].valueCents;
    return {
      values: points.map((point) => point.valueCents),
      trend: last < first ? 'down' : 'up',
      summary: `de ${formatEuros(first, true)} a ${formatEuros(last, true)}`,
    };
  });

  protected readonly related = computed(() =>
    this.store.related().map((item) => {
      const state = item.ownedCopies > 0 ? 'owned' : item.isWished ? 'wished' : 'missing';
      return {
        id: item.id,
        name: item.name,
        hue: item.accentHue,
        imageUrl: item.thumbnailUrl ?? item.imageUrl,
        state,
        stateLabel: { owned: 'La tienes', wished: 'En deseos', missing: 'Te falta' }[state],
      } as const;
    }),
  );

  constructor() {
    addIcons({ chevronBack, heart, heartOutline });
    effect(() => {
      const itemId = this.itemId();
      untracked(() => void this.store.load(itemId));
    });
  }

  ionViewWillEnter(): void {
    if (this.store.item.value()) {
      void this.store.refresh();
    }
  }

  protected back(): void {
    const item = this.item();
    void (item
      ? this.nav.navigateBack(['/tabs/colecciones', this.collectionId(), 'set', item.setId])
      : this.nav.navigateBack(['/tabs/colecciones', this.collectionId()]));
  }

  protected addCopy(): void {
    void this.store.setCopies((this.item()?.ownedCopies ?? 0) + 1);
  }

  protected removeCopy(): void {
    void this.store.setCopies((this.item()?.ownedCopies ?? 0) - 1);
  }

  protected toggleWish(): void {
    void this.store.toggleWish();
  }

  protected setRange(range: PriceRange): void {
    void this.store.setRange(range);
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
