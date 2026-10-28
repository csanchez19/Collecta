import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  NavController,
  RefresherCustomEvent,
  ViewWillEnter,
} from '@ionic/angular';

import { ProfileStore } from '../../core/state/profile.store';
import { formatEuros } from '../../shared/format';
import { ItemThumbComponent } from '../../shared/ui/item-thumb/item-thumb.component';

/** Everything you are looking for, across collections. */
@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonRefresher, IonRefresherContent, IonSkeletonText, ItemThumbComponent],
})
export class WishlistPage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  protected readonly profile = inject(ProfileStore);

  protected readonly items = computed(() =>
    (this.profile.wishlist.value() ?? []).map((item) => ({
      id: item.id,
      collectionId: item.collectionId,
      name: item.name,
      setName: item.setName,
      hue: item.accentHue,
      imageUrl: item.thumbnailUrl ?? item.imageUrl,
      price: item.marketValueCents === null ? 'Sin precio' : formatEuros(item.marketValueCents),
    })),
  );

  protected readonly summary = computed(() => {
    const items = this.profile.wishlist.value() ?? [];
    const total = items.reduce((sum, item) => sum + (item.marketValueCents ?? 0), 0);
    const count = items.length === 1 ? '1 pieza' : `${items.length} piezas`;
    return `${count} · completarla costaría unos ${formatEuros(total)}`;
  });

  ionViewWillEnter(): void {
    if (this.profile.wishlist.value()) {
      void this.profile.refresh();
    }
  }

  protected openItem(collectionId: string, itemId: string): void {
    void this.nav.navigateForward(['/tabs/colecciones', collectionId, 'objeto', itemId]);
  }

  protected openCollections(): void {
    void this.nav.navigateRoot('/tabs/colecciones');
  }

  protected retry(): void {
    void this.profile.refresh();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.profile.refresh();
    await event.target.complete();
  }
}
