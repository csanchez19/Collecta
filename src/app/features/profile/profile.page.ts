import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  NavController,
  RefresherCustomEvent,
  ViewWillEnter,
} from '@ionic/angular';

import { AuthStore } from '../../core/auth/auth.store';
import { ProfileStore } from '../../core/state/profile.store';
import { SessionStore } from '../../core/state/session.store';
import { formatEuros } from '../../shared/format';
import { AchievementBadgeComponent } from '../../shared/ui/achievement-badge/achievement-badge.component';
import { ItemThumbComponent } from '../../shared/ui/item-thumb/item-thumb.component';
import { SegmentBarComponent } from '../../shared/ui/segment-bar/segment-bar.component';
import { StatTile, StatTilesComponent } from '../../shared/ui/stat-tiles/stat-tiles.component';
import { CollectionsStore } from '../collections/data/collections.store';

const WISH_PREVIEW = 4;

/** Rank shown under the name; purely cosmetic. */
function rankFor(level: number): string {
  if (level < 5) {
    return 'Aprendiz';
  }
  return level < 10 ? 'Coleccionista' : 'Experto';
}

/** Your level, achievements, wishlist preview and account. */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    AchievementBadgeComponent,
    ItemThumbComponent,
    SegmentBarComponent,
    StatTilesComponent,
  ],
})
export class ProfilePage implements ViewWillEnter {
  private readonly nav = inject(NavController);
  private readonly auth = inject(AuthStore);
  protected readonly profile = inject(ProfileStore);
  protected readonly session = inject(SessionStore);
  private readonly collections = inject(CollectionsStore);

  protected readonly signingOut = signal(false);

  protected readonly level = computed(() => {
    const progression = this.profile.progression.value();
    if (!progression) {
      return undefined;
    }
    return {
      level: progression.level,
      rank: `Nivel ${progression.level} · ${rankFor(progression.level)}`,
      ratio: progression.xpInLevel / progression.xpLevelSize,
      xp: String(progression.xpInLevel),
      size: String(progression.xpLevelSize),
      toNext: `${progression.xpLevelSize - progression.xpInLevel} XP para el nivel ${progression.level + 1}`,
    };
  });

  protected readonly tilesLoading = computed(
    () => !this.collections.catalog.value() || !this.profile.wishlist.value(),
  );

  protected readonly tiles = computed<readonly StatTile[]>(() => {
    const totals = this.collections.totals();
    return [
      { value: String(totals.owned), label: 'piezas' },
      { value: formatEuros(totals.valueCents), label: 'valor' },
      { value: String(this.profile.wishlist.value()?.length ?? 0), label: 'deseos', tone: 'wish' },
    ];
  });

  protected readonly achievementsTitle = computed(() => {
    const total = this.profile.progression.value()?.achievements.length;
    return total ? `Logros · ${this.profile.unlockedCount()}/${total}` : 'Logros';
  });

  protected readonly wishes = computed(() =>
    (this.profile.wishlist.value() ?? []).slice(0, WISH_PREVIEW).map((item) => ({
      id: item.id,
      collectionId: item.collectionId,
      name: item.name,
      hue: item.accentHue,
      imageUrl: item.thumbnailUrl ?? item.imageUrl,
      price: item.marketValueCents === null ? 'Sin precio' : formatEuros(item.marketValueCents),
    })),
  );

  ionViewWillEnter(): void {
    if (this.profile.progression.value()) {
      void this.profile.refresh();
    }
  }

  protected openWishlist(): void {
    void this.nav.navigateRoot('/tabs/deseos');
  }

  protected openItem(collectionId: string, itemId: string): void {
    void this.nav.navigateForward(['/tabs/colecciones', collectionId, 'objeto', itemId]);
  }

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    try {
      await this.auth.logout(); // AppComponent takes the user to /login.
    } finally {
      this.signingOut.set(false);
    }
  }

  protected retry(): void {
    void this.profile.refresh();
  }

  protected async onRefresh(event: RefresherCustomEvent): Promise<void> {
    await Promise.all([this.profile.refresh(), this.collections.refresh()]);
    await event.target.complete();
  }
}
