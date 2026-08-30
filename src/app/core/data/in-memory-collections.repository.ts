import { Injectable } from '@angular/core';

import { Collection } from '../models/collection.model';
import { CollectionsRepository } from './collections.repository';

/** Seed data mirroring the design prototype. Replace with the catalog API. */
const CATALOG: readonly Collection[] = [
  { id: 'c1', name: 'Hot Wheels Mainline 2024', kind: 'car', kindLabel: 'Coches a escala 1:64', ownedCount: 34, totalCount: 250, popularity: 98, mine: true, accentHue: 275 },
  { id: 'c2', name: 'Pokémon 151', kind: 'card', kindLabel: 'Cartas coleccionables', ownedCount: 112, totalCount: 165, popularity: 99, mine: true, accentHue: 190 },
  { id: 'c3', name: 'Beyblade X', kind: 'spinner', kindLabel: 'Peonzas de combate', ownedCount: 8, totalCount: 40, popularity: 74, mine: true, accentHue: 45 },
  { id: 'c4', name: 'Star Wars Black Series', kind: 'figure', kindLabel: 'Figuras de 15 cm', ownedCount: 0, totalCount: 90, popularity: 88, mine: false, accentHue: 330 },
  { id: 'c5', name: 'Funko Pop! Marvel', kind: 'figure', kindLabel: 'Figuras de vinilo', ownedCount: 0, totalCount: 300, popularity: 82, mine: false, accentHue: 150 },
  { id: 'c6', name: 'LEGO Icons', kind: 'brick', kindLabel: 'Sets de construcción', ownedCount: 0, totalCount: 28, popularity: 69, mine: false, accentHue: 95 },
];

const NETWORK_LATENCY_MS = 320;

@Injectable()
export class InMemoryCollectionsRepository extends CollectionsRepository {
  async list(): Promise<readonly Collection[]> {
    await this.simulateLatency();
    return CATALOG;
  }

  async getById(id: string): Promise<Collection | undefined> {
    await this.simulateLatency();
    return CATALOG.find((collection) => collection.id === id);
  }

  private simulateLatency(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, NETWORK_LATENCY_MS));
  }
}
