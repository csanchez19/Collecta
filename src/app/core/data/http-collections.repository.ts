import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../api/api-client';
import { Collection, CollectionKind } from '../models/collection.model';
import { CollectionsRepository } from './collections.repository';

/** Shape of `CollectionResponse` in Collecta.API. */
interface CollectionDto {
  readonly id: string;
  readonly name: string;
  readonly kind: CollectionKind;
  readonly kindLabel: string;
  readonly accentHue: number;
  readonly totalCount: number;
  readonly setCount: number;
  readonly ownedCount: number;
  readonly ownedValueCents: number;
  readonly mine: boolean;
  readonly isFavorite: boolean;
  readonly popularity: number;
}

@Injectable()
export class HttpCollectionsRepository extends CollectionsRepository {
  private readonly api = inject(ApiClient);

  async list(): Promise<readonly Collection[]> {
    const dtos = await this.api.get<CollectionDto[]>('/api/collections');
    return dtos.map(toCollection);
  }

  async getById(id: string): Promise<Collection | undefined> {
    const dto = await this.api.getOptional<CollectionDto>(`/api/collections/${encodeURIComponent(id)}`);
    return dto && toCollection(dto);
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    const path = `/api/me/favorites/${encodeURIComponent(id)}`;
    await (favorite ? this.api.put(path) : this.api.delete(path));
  }
}

function toCollection(dto: CollectionDto): Collection {
  return {
    id: dto.id,
    name: dto.name,
    kind: dto.kind,
    kindLabel: dto.kindLabel,
    ownedCount: dto.ownedCount,
    totalCount: dto.totalCount,
    setCount: dto.setCount,
    ownedValueCents: dto.ownedValueCents,
    popularity: dto.popularity,
    mine: dto.mine,
    accentHue: dto.accentHue,
    isFavorite: dto.isFavorite,
  };
}
