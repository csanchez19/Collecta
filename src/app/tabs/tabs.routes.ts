import { Routes } from '@angular/router';

import { PlaceholderPage } from '../shared/pages/placeholder/placeholder.page';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'colecciones',
        loadComponent: () =>
          import('../features/collections/collections.page').then((m) => m.CollectionsPage),
      },
      {
        // Screen 2 — listado de objetos (placeholder until built).
        path: 'colecciones/:collectionId',
        component: PlaceholderPage,
        data: { title: 'Objetos', message: 'El listado de objetos de la colección llega en el siguiente paso.' },
      },
      {
        // Screen 3 — detalle del objeto (placeholder until built).
        path: 'colecciones/:collectionId/objeto/:itemId',
        component: PlaceholderPage,
        data: { title: 'Ficha del objeto', message: 'La ficha con datos de mercado e imágenes llega en el siguiente paso.' },
      },
      {
        path: 'explorar',
        component: PlaceholderPage,
        data: { title: 'Explorar', message: 'Descubre objetos y colecciones populares. En construcción.' },
      },
      {
        // Screen 4 — añadir objeto (placeholder until built).
        path: 'anadir',
        component: PlaceholderPage,
        data: { title: 'Añadir objeto', message: 'El alta de objetos y el enlace al catálogo llegan en el siguiente paso.' },
      },
      {
        path: 'perfil',
        component: PlaceholderPage,
        data: { title: 'Perfil', message: 'Tu vitrina, avatares y colecciones favoritas. En construcción.' },
      },
      { path: '', redirectTo: 'colecciones', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'tabs/colecciones', pathMatch: 'full' },
];
