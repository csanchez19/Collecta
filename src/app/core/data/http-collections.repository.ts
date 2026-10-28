import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../api/api-client';
import { ApiError } from '../api/api-error';
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
  readonly ownedCount: number;
  readonly mine: boolean;
  readonly isFavorite: boolean;
  readonly popularity: number;
  // Not served by the API yet (sets are on their way): optional until they are.
  readonly setCount?: number;
  readonly ownedValueCents?: number;
}

@Injectable()
export class HttpCollectionsRepository extends CollectionsRepository {
  private readonly api = inject(ApiClient);

  async list(): Promise<readonly Collection[]> {
    const dtos = await this.api.get<CollectionDto[]>('/api/collections');
    return dtos.map(toCollection);
  }

  async getById(id: string): Promise<Collection | undefined> {
    try {
      return toCollection(await this.api.get<CollectionDto>(`/api/collections/${encodeURIComponent(id)}`));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    const path = `/api/collections/${encodeURIComponent(id)}/favorite`;
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
    setCount: dto.setCount ?? 0,
    ownedValueCents: dto.ownedValueCents ?? 0,
    popularity: dto.popularity,
    mine: dto.mine,
    accentHue: dto.accentHue,
    isFavorite: dto.isFavorite,
  };
}
