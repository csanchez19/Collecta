import { CatalogItem } from '../../../core/models/catalog-item.model';
import { countByFilter, itemsOnPage, milestones, nextMilestone, pageCount } from './set-binder';

function item(code: string, ownedCopies: number, isWished = false): CatalogItem {
  return {
    id: code,
    setId: 's',
    collectionId: 'c',
    name: code,
    code,
    rarity: null,
    rarityTier: 0,
    imageUrl: null,
    thumbnailUrl: null,
    marketValueCents: null,
    priceChangePct: null,
    attributes: [],
    setName: 'Set',
    accentHue: 30,
    ownedCopies,
    isWished,
  };
}

describe('set binder rules', () => {
  it('counts items per filter', () => {
    const counts = countByFilter([item('001', 2), item('002', 0, true), item('003', 0)]);
    expect(counts).toEqual({ all: 3, owned: 1, missing: 2, wished: 1 });
  });

  it('splits items into pages of nine, with at least one page', () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    expect(pageCount(20)).toBe(3);
    expect(pageCount(0)).toBe(1);
    expect(itemsOnPage(items, 2)).toEqual([18, 19]);
  });

  it('marks milestones reached by rounding the requirement up', () => {
    expect(milestones(7, 27).map((m) => m.reached)).toEqual([true, false, false, false]);
    expect(milestones(6, 27)[0].reached).toBe(false);
  });

  it('tells how many items the next milestone needs', () => {
    expect(nextMilestone(28, 165)).toEqual({ percent: 25, missing: 14 });
    expect(nextMilestone(165, 165)).toBeNull();
    expect(nextMilestone(0, 0)).toBeNull();
  });
});
