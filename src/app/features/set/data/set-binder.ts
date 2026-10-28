import { CatalogItem } from '../../../core/models/catalog-item.model';

/** Pure rules of the set screen: filters, album pages and progress milestones. */

export type ItemFilter = 'all' | 'owned' | 'missing' | 'wished';

export const ITEM_FILTERS: readonly ItemFilter[] = ['all', 'owned', 'missing', 'wished'];

/** Pockets on one album page (3 × 3). */
export const BINDER_PAGE_SIZE = 9;

export const MILESTONE_PERCENTS: readonly number[] = [25, 50, 75, 100];

export function matchesFilter(item: CatalogItem, filter: ItemFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'owned':
      return item.ownedCopies > 0;
    case 'missing':
      return item.ownedCopies === 0;
    case 'wished':
      return item.isWished;
  }
}

export function countByFilter(items: readonly CatalogItem[]): Record<ItemFilter, number> {
  return {
    all: items.length,
    owned: items.filter((item) => matchesFilter(item, 'owned')).length,
    missing: items.filter((item) => matchesFilter(item, 'missing')).length,
    wished: items.filter((item) => matchesFilter(item, 'wished')).length,
  };
}

export function pageCount(itemCount: number): number {
  return Math.max(1, Math.ceil(itemCount / BINDER_PAGE_SIZE));
}

export function itemsOnPage<T>(items: readonly T[], page: number): readonly T[] {
  return items.slice(page * BINDER_PAGE_SIZE, (page + 1) * BINDER_PAGE_SIZE);
}

export interface Milestone {
  readonly percent: number;
  readonly reached: boolean;
}

export function milestones(owned: number, total: number): readonly Milestone[] {
  return MILESTONE_PERCENTS.map((percent) => ({
    percent,
    reached: total > 0 && owned >= requiredFor(percent, total),
  }));
}

/** The first milestone not reached yet and how many items it still needs. */
export function nextMilestone(owned: number, total: number): { percent: number; missing: number } | null {
  if (total === 0) {
    return null;
  }
  const percent = MILESTONE_PERCENTS.find((p) => owned < requiredFor(p, total));
  return percent === undefined ? null : { percent, missing: requiredFor(percent, total) - owned };
}

function requiredFor(percent: number, total: number): number {
  return Math.ceil((total * percent) / 100);
}
