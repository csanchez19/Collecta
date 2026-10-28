# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Collecta — a mobile app (Ionic + Angular, Capacitor) to manage physical
collections (Hot Wheels, Pokémon cards, Beyblades…). The backend is the sibling
repo `../Collecta-API` (ASP.NET Core, runs on http://localhost:5215; base URL
in `src/environments/environment*.ts`). Environments are picked with
`-c=<config>` on `ng serve`/`ng build`: `local` → `environment.local.ts`
(the API on this machine), `production` → `environment.prod.ts`. `design/` holds the source design canvas
(`*.dc.html`, `canvas.json`) and `design/collecta-mvp.html` the published
clickable prototype the screens are built from.

## Git rules

- **Claude never commits, merges, pushes, resets or rebases.** Carles does all
  history changes. Claude may create/switch branches on a clean tree.
- `main` — releases. `develop` — integration branch, everything starts here.
- `feature/<nombre-desarrollo>` — every new development (kebab-case).
- `bugfix/<nombre-del-bug>` — every bug fix.

Before starting a task, check the current branch and propose the right one.

## Commands

```bash
npm start                       # ng serve — dev server at http://localhost:4200
npm run start:local             # ng serve -c=local — API on this machine (http://localhost:5215)
npm run build                   # production build to www/ (enforces bundle budgets)
npm run build -- --configuration development   # fast unminified build
npm test                        # vitest (jsdom) via @angular/build:unit-test, watch mode
npm test -- --configuration ci  # single run, no watch
npx ng test -- --test-path-pattern collections   # run one spec by path fragment
npm run lint                    # angular-eslint over src/**/*.ts + templates
npx ionic cap add ios|android   # add a native platform when needed
```

Angular 22, Ionic 9, standalone APIs only. TypeScript `strict` plus
`noPropertyAccessFromIndexSignature` and `strictTemplates` — bracket-access on
index signatures and loose template refs are build errors.

## Architecture

**Zoneless.** `provideZonelessChangeDetection()` in `src/main.ts`; `polyfills`
is empty (no zone.js). Every component is `ChangeDetectionStrategy.OnPush` and
reads state through signals — do not introduce `zone.js` or default CD.

**Signals-first state, no RxJS in app code.** State lives in `@Injectable`
stores that expose **read-only** signals + `computed`, and mutate only through
intent methods:

- `core/auth/auth.store.ts` — `AuthStore`: signed-in user + tokens, persisted
  in `localStorage`. `userId` is a primitive `computed` so effects re-run only on
  account change, not on every token refresh.
- `core/state/session.store.ts` — `SessionStore` (`providedIn: 'root'`):
  cross-cutting user state (display name from `AuthStore`, favourite collection
  ids — seeded from the catalog fetch, toggled optimistically against the API).
  Any screen may read it.
- `core/state/profile.store.ts` — `ProfileStore` (root): level/XP and
  achievements, recently added items and the wishlist. Screens that change
  ownership call `refresh()` on it.
- `features/<feature>/data/<feature>.store.ts` — feature stores. List screens
  (`CollectionsStore`) are root-provided so state survives tab switches;
  detail screens (`CollectionDetailStore`, `SetDetailStore`, `ItemDetailStore`)
  are provided by their page (`providers: [...]`), one instance per screen in the
  Ionic stack. A store owns *domain* selection (which items, what order,
  active filters, album page); it does **not** build presentation strings.
- `core/state/loadable.ts` — `Loadable<T>`: every async value uses it. First
  load → `isFirstLoad()` (skeletons); refresh keeps the value on screen; errors
  only replace the screen when there is nothing to show (`hasError()`); stale
  responses are dropped. Pages re-fetch quietly in `ionViewWillEnter`.

**Data access is behind an abstract class (DIP).** `core/data/*.repository.ts`
declares an `abstract class` boundary (`CollectionsRepository`,
`CatalogRepository` for sets/items/ownership, `ProfileRepository` for
progression/recent/wishlist); concrete implementations are bound once in
`core/core.providers.ts` via `provideCore()`. Nothing else references a concrete
repository. They are bound to the HTTP implementations
(`Http{Collections,Catalog,Profile}Repository`); API response shapes live in
`core/data/http/catalog.dtos.ts` and their mapping to app models in
`catalog.mappers.ts` (incl. Spanish labels for item attributes, which the API
returns raw as imported). There is no sample/seed data in the app: data
always comes from the API (Carles loads the catalog with the API's
importer). Catalog
endpoints are public; `/api/me/*` holds the user's copies, wishlist,
favourites, recent items and progression. `ApiClient.getOptional()` turns a 404
into `undefined`.

**HTTP is `fetch` + promises, not `HttpClient`** (keeps RxJS out). HTTP
repositories use `core/api/api-client.ts` (`ApiClient`), which attaches the
bearer token and, on a 401, refreshes once and retries. `AuthStore.refresh()` is
single-flight on purpose: the API treats a reused refresh token as stolen and
revokes every session, so never refresh in parallel. Errors surface as
`ApiError` (`status` 0 = server unreachable; `message` = the API's ProblemDetails
`title`, already in Spanish).

**Presentation mapping happens in the page.** A page injects its store +
`SessionStore`, then a `computed()` maps domain models to a `*.vm.ts` view
model (progress ratio, padded counts, euro strings via `shared/format.ts`,
`isFavorite`). Because the mapping reads the
favourites signal, toggling a favourite re-derives the cards automatically.

**Components split three ways, always.** `templateUrl` + `styleUrls` on every
component — no inline templates/styles (also enforced: `anyComponentStyle`
budget is 4 kB). Feature-local presentational components live under
`features/<feature>/components/`; they take `input.required()`, emit `output()`
intent, and never navigate or mutate a store.

**Loading states are part of every design.** Whenever a screen from a design
is implemented, it ships with a proper skeleton loading state, never a bare
spinner or a blank page: skeleton blocks that mirror the real layout (same
sections, same card/thumbnail shapes and sizes) so the user sees what is
loading and where it will appear. Also cover the error state (message + retry)
and the empty state. A refresh of data that is already on screen keeps the
current content visible instead of flashing back to skeletons.

**Routing.** `app.routes.ts`: `/login` (`guestGuard`, provisional screen — no
design yet) and everything else behind `authGuard` → `tabs/tabs.routes.ts`.
`AppComponent` sends the user back to `/login` when the session ends. The `tabs` shell has four
tabs (colecciones / explorar / deseos / perfil). Deep routes stay inside the
colecciones tab stack so the back button works:
`colecciones/:collectionId` (sets), `colecciones/:collectionId/set/:setId`
(album) and `colecciones/:collectionId/objeto/:itemId` (item). Route params
reach pages as inputs via `withComponentInputBinding()`. Explorar is still the
reusable `shared/pages/placeholder` page parametrised by route `data`.

**Theming.** Single dark theme, champagne gold with a restrained gaming edge
(design: the "Collecta rediseño" canvas). Colours carry meaning everywhere:
gold = primary action / owned / progress, lilac = wishlist, sage = price up,
rose = price down / errors. `theme/variables.scss` maps the palette onto Ionic
variables plus `--collecta-*` tokens. `theme/ui.scss` (global, listed in
`angular.json` styles) holds the shared primitives — `.chamfer` (cut corners,
size with `--cut`), `.hud` (gold corner brackets), `.hex`, `.diamond`,
`.section-label`, `.num` (display font, tabular numbers), `.tone-*` (collection
tones derived from `--hue`, the collection's `accentHue`), `.btn-primary`,
`.icon-btn`, `.state-block`, skeleton styling and the `grid-bg` page
background. Put repeated visual language there, not in component styles.
Reusable presentational pieces live in `shared/ui/` (segment bar, item thumb /
album pocket, rarity marks, achievement badge, page banner, stat tiles).
`provideIonicAngular({ mode: 'ios' })` forces iOS transitions on all
platforms. Fonts (Chakra Petch for titles and numbers, Barlow for text) load
from Google Fonts in `index.html`.
