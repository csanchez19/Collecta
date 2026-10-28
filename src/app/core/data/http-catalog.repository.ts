import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../api/api-client';
import { CatalogItem, PricePoint, PriceRange } from '../models/catalog-item.model';
import { CollectionSet } from '../models/collection-set.model';
import { CatalogRepository } from './catalog.repository';
import { ItemDto, PricePointDto, SetDto } from './http/catalog.dtos';
import { toCatalogItem, toCollectionSet } from './http/catalog.mappers';

/** Sets, items and ownership against Collecta.API (public catalog + `/api/me`). */
@Injectable()
export class HttpCatalogRepository extends CatalogRepository {
  private readonly api = inject(ApiClient);

  async listSets(collectionId: string): Promise<readonly CollectionSet[]> {
    const dtos = await this.api.get<SetDto[]>(`/api/collections/${id(collectionId)}/sets`);
    return dtos.map(toCollectionSet);
  }

  async getSet(setId: string): Promise<CollectionSet | undefined> {
    const dto = await this.api.getOptional<SetDto>(`/api/sets/${id(setId)}`);
    return dto && toCollectionSet(dto);
  }

  async listItems(setId: string): Promise<readonly CatalogItem[]> {
    const dtos = await this.api.get<ItemDto[]>(`/api/sets/${id(setId)}/items`);
    return dtos.map(toCatalogItem);
  }

  async getItem(itemId: string): Promise<CatalogItem | undefined> {
    const dto = await this.api.getOptional<ItemDto>(`/api/items/${id(itemId)}`);
    return dto && toCatalogItem(dto);
  }

  async getPriceHistory(itemId: string, range: PriceRange): Promise<readonly PricePoint[]> {
    return this.api.get<PricePointDto[]>(`/api/items/${id(itemId)}/prices?range=${range}`);
  }

  async setOwnedCopies(itemId: string, copies: number): Promise<void> {
    await this.api.put(`/api/me/items/${id(itemId)}`, { copies });
  }

  async setWished(itemId: string, wished: boolean): Promise<void> {
    const path = `/api/me/wishlist/${id(itemId)}`;
    await (wished ? this.api.put(path) : this.api.delete(path));
  }
}

function id(value: string): string {
  return encodeURIComponent(value);
}
