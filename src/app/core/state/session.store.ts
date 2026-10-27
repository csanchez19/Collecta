import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthStore } from '../auth/auth.store';
import { CollectionsRepository } from '../data/collections.repository';

/**
 * Cross-cutting user state that every screen can read: profile identity and the
 * collections the user has starred. Kept deliberately small — feature-specific
 * state lives in feature stores.
 *
 * All state is exposed as read-only signals; mutation happens only through the
 * intent methods below.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly auth = inject(AuthStore);
  private readonly repository = inject(CollectionsRepository);
  private readonly _favoriteCollectionIds = signal<ReadonlySet<string>>(new Set());

  readonly displayName = computed(() => this.auth.user()?.displayName ?? 'Coleccionista');
  readonly favoriteCollectionIds = this._favoriteCollectionIds.asReadonly();
  readonly favoriteCount = computed(() => this._favoriteCollectionIds().size);
  readonly initials = computed(() => this.displayName().charAt(0).toUpperCase());

  isFavoriteCollection(id: string): boolean {
    return this._favoriteCollectionIds().has(id);
  }

  /** Called with the server's favourites whenever the catalog is (re)fetched. */
  replaceFavorites(ids: Iterable<string>): void {
    this._favoriteCollectionIds.set(new Set(ids));
  }

  /** Optimistic: the star flips at once and flips back if the API rejects the change. */
  async toggleFavoriteCollection(id: string): Promise<void> {
    const favorite = !this.isFavoriteCollection(id);
    this.setFavoriteLocally(id, favorite);
    try {
      await this.repository.setFavorite(id, favorite);
    } catch {
      this.setFavoriteLocally(id, !favorite);
    }
  }

  private setFavoriteLocally(id: string, favorite: boolean): void {
    this._favoriteCollectionIds.update((current) => {
      const next = new Set(current);
      if (favorite) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
