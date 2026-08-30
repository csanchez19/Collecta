import { Injectable, computed, signal } from '@angular/core';

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
  private readonly _displayName = signal('Dani');
  private readonly _favoriteCollectionIds = signal<ReadonlySet<string>>(new Set(['c1', 'c2']));

  readonly displayName = this._displayName.asReadonly();
  readonly favoriteCollectionIds = this._favoriteCollectionIds.asReadonly();
  readonly favoriteCount = computed(() => this._favoriteCollectionIds().size);
  readonly initials = computed(() => this._displayName().charAt(0).toUpperCase());

  isFavoriteCollection(id: string): boolean {
    return this._favoriteCollectionIds().has(id);
  }

  toggleFavoriteCollection(id: string): void {
    this._favoriteCollectionIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  setDisplayName(name: string): void {
    this._displayName.set(name.trim() || 'Coleccionista');
  }
}
