# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Collecta — a mobile app (Ionic + Angular, Capacitor) to manage physical
collections (Hot Wheels, Pokémon cards, Beyblades…). A .NET backend is planned
but not in this repo yet. `design/` holds the source design canvas
(`*.dc.html`, `canvas.json`) and `design/collecta-mvp.html` the published
clickable prototype the screens are built from.

## Commands

```bash
npm start                       # ng serve — dev server at http://localhost:4200
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

- `core/state/session.store.ts` — `SessionStore` (`providedIn: 'root'`):
  cross-cutting user state (display name, favourite collection ids). Any screen
  may read it.
- `features/<feature>/data/<feature>.store.ts` — feature stores, also
  root-provided so state and the one catalog fetch survive tab switches /
  back-navigation. A store owns *domain* selection (which items, what order,
  active filters); it does **not** build presentation strings.

**Data access is behind an abstract class (DIP).** `core/data/*.repository.ts`
declares an `abstract class` boundary; concrete implementations
(`InMemoryCollectionsRepository` today, HTTP later) are bound once in
`core/core.providers.ts` via `provideCore()`. Nothing else references a concrete
repository.

**Presentation mapping happens in the page.** A page injects its store +
`SessionStore`, then a `computed()` maps domain models to a `*.vm.ts` view
model (progress %, gradient string, `isFavorite`). Because the mapping reads the
favourites signal, toggling a favourite re-derives the cards automatically.

**Components split three ways, always.** `templateUrl` + `styleUrls` on every
component — no inline templates/styles (also enforced: `anyComponentStyle`
budget is 4 kB). Feature-local presentational components live under
`features/<feature>/components/`; they take `input.required()`, emit `output()`
intent, and never navigate or mutate a store.

**Routing.** `app.routes.ts` → `tabs/tabs.routes.ts`. The `tabs` shell has four
tabs (colecciones / explorar / anadir / perfil). Screens 2–4 (objetos, ficha,
añadir) are currently one reusable `shared/pages/placeholder` component
parametrised by route `data` (bound to inputs via `withComponentInputBinding()`);
replace each with a real feature module when built. Deep routes
(`colecciones/:collectionId/objeto/:itemId`) stay inside the colecciones tab
stack so the back button works.

**Theming.** Single dark theme. `theme/variables.scss` maps the Collecta
palette onto Ionic CSS variables and adds `--collecta-*` tokens used by
component styles; `global.scss` imports `dark.always.css` and sets the display
font. `provideIonicAngular({ mode: 'ios' })` forces iOS transitions on all
platforms. Fonts (Space Grotesk, Unbounded) load from Google Fonts in
`index.html`.
