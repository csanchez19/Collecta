import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../api/api-client';
import { CatalogItem } from '../models/catalog-item.model';
import { Progression } from '../models/progression.model';
import { ItemDto, ProgressionDto } from './http/catalog.dtos';
import { toCatalogItem } from './http/catalog.mappers';
import { ProfileRepository } from './profile.repository';

/** The signed-in user's level, recent additions and wishlist from `/api/me`. */
@Injectable()
export class HttpProfileRepository extends ProfileRepository {
  private readonly api = inject(ApiClient);

  getProgression(): Promise<Progression> {
    return this.api.get<ProgressionDto>('/api/me/progression');
  }

  async listRecentlyAdded(limit: number): Promise<readonly CatalogItem[]> {
    const dtos = await this.api.get<ItemDto[]>(`/api/me/items/recent?limit=${limit}`);
    return dtos.map(toCatalogItem);
  }

  async listWishlist(): Promise<readonly CatalogItem[]> {
    const dtos = await this.api.get<ItemDto[]>('/api/me/wishlist');
    return dtos.map(toCatalogItem);
  }
}
