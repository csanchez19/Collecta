import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
  SearchbarCustomEvent,
  SegmentCustomEvent,
} from '@ionic/angular';

import { Collection } from '../../core/models/collection.model';
import { CollectionScope } from '../../core/models/collection-scope';
import { SessionStore } from '../../core/state/session.store';
import { CollectionCardComponent } from './components/collection-card/collection-card.component';
import { CollectionsStore } from './data/collections.store';
import { CollectionCardVm } from './models/collection-card.vm';

/** Screen 1 — search your collections, the popular ones and suggestions. */
@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonAvatar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText,
    IonText,
    CollectionCardComponent,
  ],
})
export class CollectionsPage {
  private readonly router = inject(Router);
  protected readonly store = inject(CollectionsStore);
  protected readonly session = inject(SessionStore);

  protected readonly skeletons = Array.from({ length: 4 });

  /** Domain → view model, re-derived whenever the list or favorites change. */
  protected readonly cards = computed<readonly CollectionCardVm[]>(() =>
    this.store.visibleCollections().map((collection) => this.toCardVm(collection)),
  );

  protected onSearch(event: SearchbarCustomEvent): void {
    this.store.setQuery(event.detail.value ?? '');
  }

  protected onScopeChange(event: SegmentCustomEvent): void {
    this.store.setScope(event.detail.value as CollectionScope);
  }

  protected onToggleFavorite(id: string): void {
    void this.session.toggleFavoriteCollection(id);
  }

  protected openCollection(id: string): void {
    void this.router.navigate(['/tabs/colecciones', id]);
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.store.reload();
    await event.target.complete();
  }

  private toCardVm(collection: Collection): CollectionCardVm {
    const ratio = collection.totalCount === 0 ? 0 : collection.ownedCount / collection.totalCount;
    return {
      id: collection.id,
      name: collection.name,
      kind: collection.kind,
      kindLabel: collection.kindLabel,
      progressRatio: ratio,
      progressPercentLabel: `${Math.round(ratio * 100)}%`,
      progressCountLabel: `${collection.ownedCount} / ${collection.totalCount}`,
      accent: `linear-gradient(150deg, oklch(0.72 0.17 ${collection.accentHue}), oklch(0.55 0.16 ${collection.accentHue + 45}))`,
      isFavorite: this.session.isFavoriteCollection(collection.id),
    };
  }
}
