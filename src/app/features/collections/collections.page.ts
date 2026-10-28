import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { chevronDown, searchOutline } from 'ionicons/icons';

import { CatalogItem, RarityTier } from '../../core/models/catalog-item.model';
import { Collection } from '../../core/models/collection.model';
import { ProfileStore } from '../../core/state/profile.store';
import { SessionStore } from '../../core/state/session.store';
import { countWidth, formatEuros, initials, padCount } from '../../shared/format';
import { ItemThumbComponent } from '../../shared/ui/item-thumb/item-thumb.component';
import { RarityMarksComponent } from '../../shared/ui/rarity-marks/rarity-marks.component';
import { SegmentBarComponent } from '../../shared/ui/segment-bar/segment-bar.component';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { LevelPanelComponent } from './components/level-panel/level-panel.component';
import { COLLECTION_SORTS, CollectionSort, CollectionsStore } from './data/collections.store';
import { CollectionCardVm } from './models/collection-card.vm';
import { LevelPanelVm } from './models/level-panel.vm';

const SORT_LABEL: Record<CollectionSort, string> = {
  completion: 'Más completas',
  value: 'Más valiosas',
  name: 'De la A a la Z',
};

interface RecentVm {
  readonly id: string;
  readonly collectionId: string;
  readonly name: string;
  readonly setName: string;
  readonly hue: number;
  readonly imageUrl: string | null;
  readonly tier: RarityTier;
}

/** Home — your level, what you added lately and your collections. */
@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    CollectionCardComponent,
    ItemThumbComponent,
    LevelPanelComponent,
    RarityMarksComponent,
    SegmentBarComponent,
  ],
})
export class CollectionsPage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  protected readonly store = inject(CollectionsStore);
  protected readonly profile = inject(ProfileStore);
  protected readonly session = inject(SessionStore);

  protected readonly sortLabel = computed(() => SORT_LABEL[this.store.sort()]);

  protected readonly hero = computed<LevelPanelVm | undefined>(() => {
    const progression = this.profile.progression.value();
    if (!progression || !this.store.catalog.value()) {
      return undefined;
    }
    const totals = this.store.totals();
    return {
      greeting: `Hola, ${this.session.displayName()}`,
      ownedLabel: String(totals.owned),
      valueLabel: formatEuros(totals.valueCents),
      level: progression.level,
      xpRatio: progression.xpInLevel / progression.xpLevelSize,
      xpLabel: String(progression.xpInLevel),
      xpSizeLabel: String(progression.xpLevelSize),
      toNextLabel: `${progression.xpLevelSize - progression.xpInLevel} XP para el nivel ${progression.level + 1}`,
      setCount: totals.sets,
      wishCount: this.profile.wishlist.value()?.length ?? 0,
      achievementCount: this.profile.unlockedCount(),
    };
  });

  protected readonly heroFailed = computed(
    () => this.profile.progression.hasError() || this.store.catalog.hasError(),
  );

  protected readonly cards = computed<readonly CollectionCardVm[]>(() =>
    this.store.myCollections().map((collection) => this.toCardVm(collection)),
  );

  protected readonly recent = computed<readonly RecentVm[]>(() =>
    (this.profile.recent.value() ?? []).map((item) => toRecentVm(item)),
  );

  protected readonly nextGoal = computed(() => {
    const achievement = this.profile.nextAchievement();
    return achievement
      ? { name: achievement.name, ratio: achievement.progress, percent: `${Math.round(achievement.progress * 100)} %` }
      : undefined;
  });

  constructor() {
    addIcons({ searchOutline, chevronDown });
  }

  ionViewWillEnter(): void {
    // Ownership may have changed on another screen: refresh quietly, content stays visible.
    if (this.store.catalog.value()) {
      void this.store.refresh();
      void this.profile.refresh();
    }
  }

  protected cycleSort(): void {
    const next = (COLLECTION_SORTS.indexOf(this.store.sort()) + 1) % COLLECTION_SORTS.length;
    this.store.setSort(COLLECTION_SORTS[next]);
  }

  protected onToggleFavorite(id: string): void {
    void this.session.toggleFavoriteCollection(id);
  }

  protected openCollection(id: string): void {
    void this.nav.navigateForward(['/tabs/colecciones', id]);
  }

  protected openItem(item: RecentVm): void {
    void this.nav.navigateForward(['/tabs/colecciones', item.collectionId, 'objeto', item.id]);
  }

  protected openExplore(): void {
    void this.nav.navigateRoot('/tabs/explorar');
  }

  protected retry(): void {
    void this.store.refresh();
    void this.profile.refresh();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await Promise.all([this.store.refresh(), this.profile.refresh()]);
    await event.target.complete();
  }

  private toCardVm(collection: Collection): CollectionCardVm {
    const width = countWidth(collection.totalCount);
    return {
      id: collection.id,
      name: collection.name,
      kind: collection.kind,
      kindLabel: collection.kindLabel,
      hue: collection.accentHue,
      ghost: initials(collection.name),
      ratio: collection.totalCount === 0 ? 0 : collection.ownedCount / collection.totalCount,
      ownedLabel: padCount(collection.ownedCount, width),
      totalLabel: padCount(collection.totalCount, width),
      meta: collection.setCount === 1 ? '1 set' : `${collection.setCount} sets`,
      valueLabel: formatEuros(collection.ownedValueCents),
      isFavorite: this.session.isFavoriteCollection(collection.id),
    };
  }
}

function toRecentVm(item: CatalogItem): RecentVm {
  return {
    id: item.id,
    collectionId: item.collectionId,
    name: item.name,
    setName: item.setName,
    hue: item.accentHue,
    imageUrl: item.thumbnailUrl ?? item.imageUrl,
    tier: item.rarityTier,
  };
}
