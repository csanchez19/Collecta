import { Routes } from '@angular/router';

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
        // Deep routes stay inside the colecciones tab stack so back navigation works.
        path: 'colecciones/:collectionId',
        loadComponent: () =>
          import('../features/collection/collection.page').then((m) => m.CollectionPage),
      },
      {
        path: 'colecciones/:collectionId/set/:setId',
        loadComponent: () => import('../features/set/set.page').then((m) => m.SetPage),
      },
      {
        path: 'colecciones/:collectionId/objeto/:itemId',
        loadComponent: () => import('../features/item/item.page').then((m) => m.ItemPage),
      },
      {
        path: 'explorar',
        loadComponent: () => import('../features/explore/explore.page').then((m) => m.ExplorePage),
      },
      {
        path: 'deseos',
        loadComponent: () => import('../features/wishlist/wishlist.page').then((m) => m.WishlistPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('../features/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'colecciones', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'tabs/colecciones', pathMatch: 'full' },
];
