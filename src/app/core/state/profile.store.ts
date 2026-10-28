import { Injectable, computed, effect, inject, untracked } from '@angular/core';

import { AuthStore } from '../auth/auth.store';
import { ProfileRepository } from '../data/profile.repository';
import { CatalogItem } from '../models/catalog-item.model';
import { Achievement, Progression } from '../models/progression.model';
import { Loadable } from './loadable';

const RECENT_LIMIT = 8;

/**
 * The signed-in user's level, recent additions and wishlist. Cross-cutting: the
 * home, wishlist and profile screens all read it, and any screen that changes
 * ownership calls `refresh()`.
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly repository = inject(ProfileRepository);
  private readonly auth = inject(AuthStore);

  readonly progression = new Loadable<Progression>();
  readonly recent = new Loadable<readonly CatalogItem[]>();
  readonly wishlist = new Loadable<readonly CatalogItem[]>();

  /** The locked achievement closest to unlocking — the next goal to show. */
  readonly nextAchievement = computed<Achievement | undefined>(() =>
    this.progression
      .value()
      ?.achievements.filter((achievement) => !achievement.unlocked)
      .reduce<Achievement | undefined>(
        (best, achievement) => (!best || achievement.progress > best.progress ? achievement : best),
        undefined,
      ),
  );

  readonly unlockedCount = computed(
    () => this.progression.value()?.achievements.filter((achievement) => achievement.unlocked).length ?? 0,
  );

  constructor() {
    // Everything here is per user: start over whenever the account changes.
    effect(() => {
      const userId = this.auth.userId();
      untracked(() => {
        this.progression.reset();
        this.recent.reset();
        this.wishlist.reset();
        if (userId) {
          void this.refresh();
        }
      });
    });
  }

  async refresh(): Promise<void> {
    await Promise.all([
      this.progression.load(() => this.repository.getProgression()),
      this.recent.load(() => this.repository.listRecentlyAdded(RECENT_LIMIT)),
      this.wishlist.load(() => this.repository.listWishlist()),
    ]);
  }
}
