import { toAttributes, toCatalogItem } from './catalog.mappers';
import { ItemDto } from './catalog.dtos';

describe('catalog mappers', () => {
  it('labels known card attributes in Spanish, in a fixed order', () => {
    const attributes = toAttributes({
      illustrator: 'Mitsuhiro Arita',
      stage: 'Stage2',
      types: ['Fire'],
      hp: 120,
      category: 'Pokemon',
      dexId: [6],
      evolveFrom: 'Charmeleon',
    });

    expect(attributes).toEqual([
      { label: 'PS', value: '120' },
      { label: 'Tipo', value: 'Fuego' },
      { label: 'Fase', value: 'Fase 2' },
      { label: 'Evoluciona de', value: 'Charmeleon' },
      { label: 'Ilustrador', value: 'Mitsuhiro Arita' },
    ]);
  });

  it('shows the category of trainers and keeps unknown keys from other sources', () => {
    const attributes = toAttributes({ category: 'Trainer', trainerType: 'Supporter', scale: '1:64' });

    expect(attributes).toEqual([
      { label: 'Categoría', value: 'Entrenador' },
      { label: 'Tipo de entrenador', value: 'Partidario' },
      { label: 'Scale', value: '1:64' },
    ]);
  });

  it('joins several types and skips empty values', () => {
    expect(toAttributes({ types: ['Water', 'Metal'], illustrator: '', hp: null })).toEqual([
      { label: 'Tipo', value: 'Agua · Metálico' },
    ]);
    expect(toAttributes(null)).toEqual([]);
  });

  it('maps an item, defaulting a missing code to an empty string', () => {
    const dto: ItemDto = {
      id: 'i',
      setId: 's',
      collectionId: 'c',
      setName: 'Base Set',
      accentHue: 30,
      name: 'Charizard',
      code: null,
      rarity: 'Rare',
      rarityTier: 2,
      imageUrl: null,
      thumbnailUrl: null,
      marketValueCents: 49435,
      priceChangePct: 4.2,
      attributes: { hp: 120 },
      ownedCopies: 2,
      isWished: false,
    };

    const item = toCatalogItem(dto);

    expect(item.code).toBe('');
    expect(item.attributes).toEqual([{ label: 'PS', value: '120' }]);
    expect(item.ownedCopies).toBe(2);
  });
});
