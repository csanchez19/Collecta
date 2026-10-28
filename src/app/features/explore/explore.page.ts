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

import { Collection } from '../../core/models/collection.model';
import { SessionStore } from '../../core/state/session.store';
import { KIND_FILTER_LABEL, itemNoun } from '../../shared/collection-kind';
import { formatMonth, formatNumber, initials } from '../../shared/format';
import { ExploreRowComponent } from './components/explore-row/explore-row.component';
import { FeaturedCollectionComponent } from './components/featured-collection/featured-collection.component';
import { KindFilter } from './data/explore-filters';
import { ExploreStore } from './data/explore.store';
import { ExploreRowVm, FeaturedSetVm, FeaturedVm } from './models/explore.vm';

const RECENT_SETS = 4;

/** Explorar — the whole catalog, to discover and follow collections. */
@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    ExploreRowComponent,
    FeaturedCollectionComponent,
  ],
})
export class ExplorePage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  protected readonly store = inject(ExploreStore);
  protected readonly session = inject(SessionStore);

  protected readonly chips = computed(() =>
    this.store.kinds().map((entry) => ({
      kind: entry.kind,
      label: entry.kind === 'all' ? 'Todas' : KIND_FILTER_LABEL[entry.kind],
      count: entry.count,
      active: this.store.kind() === entry.kind,
    })),
  );

  protected readonly sortLabel = computed(() => (this.store.sort() === 'popular' ? 'Más populares' : 'De la A a la Z'));

  protected readonly listTitle = computed(() => {
    const filtered = this.store.kind() !== 'all' || this.store.query().trim() !== '';
    return `${filtered ? 'Resultados' : 'Todas las colecciones'} · ${this.store.visible().length}`;
  });

  protected readonly rows = computed<readonly ExploreRowVm[]>(() =>
    this.store.visible().map((collection) => this.toRow(collection)),
  );

  protected readonly featured = computed<FeaturedVm | undefined>(() => {
    const collection = this.store.featured();
    if (!collection || !this.store.showFeatured()) {
      return undefined;
    }
    return {
      id: collection.id,
      name: collection.name,
      kindLabel: collection.kindLabel,
      hue: collection.accentHue,
      ghost: initials(collection.name),
      setCount: formatNumber(collection.setCount),
      itemCount: formatNumber(collection.totalCount),
      itemNoun: itemNoun(collection.kind, collection.totalCount),
      popularity: `${collection.popularity} %`,
      ctaLabel: collection.setCount === 1 ? 'Ver el set' : `Ver los ${formatNumber(collection.setCount)} sets`,
      isFavorite: this.session.isFavoriteCollection(collection.id),
    };
  });

  protected readonly featuredSets = computed<readonly FeaturedSetVm[]>(() =>
    (this.store.featuredSets.value() ?? []).slice(0, RECENT_SETS).map((set) => ({
      id: set.id,
      mark: initials(set.name),
      name: set.name,
      date: set.releaseDate ? formatMonth(set.releaseDate) : '',
    })),
  );

  constructor() {
    addIcons({ searchOutline, chevronDown });
  }

  ionViewWillEnter(): void {
    // Favourites or ownership may have changed on another screen: refresh quietly.
    if (this.store.status.value()) {
      void this.store.refresh();
    }
  }

  protected setKind(kind: KindFilter): void {
    this.store.setKind(kind);
  }

  protected onSearch(event: Event): void {
    this.store.setQuery((event.target as HTMLInputElement).value);
  }

  protected toggleFavorite(collectionId: string): void {
    void this.session.toggleFavoriteCollection(collectionId);
  }

  protected openCollection(collectionId: string): void {
    void this.nav.navigateForward(['/tabs/colecciones', collectionId]);
  }

  protected openSet(setId: string): void {
    const collectionId = this.store.featured()?.id;
    if (collectionId) {
      void this.nav.navigateForward(['/tabs/colecciones', collectionId, 'set', setId]);
    }
  }

  protected retry(): void {
    void this.store.refresh();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.store.refresh();
    await event.target.complete();
  }

  private toRow(collection: Collection): ExploreRowVm {
    const sets = collection.setCount === 1 ? '1 set' : `${formatNumber(collection.setCount)} sets`;
    const items = `${formatNumber(collection.totalCount)} ${itemNoun(collection.kind, collection.totalCount)}`;
    return {
      id: collection.id,
      name: collection.name,
      kind: collection.kind,
      hue: collection.accentHue,
      ghost: initials(collection.name),
      meta: `${sets} · ${items}`,
      popularityRatio: collection.popularity / 100,
      popularityLabel: `${collection.popularity} % la colecciona`,
      ownedLabel:
        collection.ownedCount > 0
          ? `Tienes ${formatNumber(collection.ownedCount)} ${itemNoun(collection.kind, collection.ownedCount)}`
          : null,
      isFavorite: this.session.isFavoriteCollection(collection.id),
    };
  }
}
