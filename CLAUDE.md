# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Collecta — a mobile app (Ionic + Angular, Capacitor) to manage physical
collections (Hot Wheels, Pokémon cards, Beyblades…). The backend is the sibling
repo `../Collecta-API` (ASP.NET Core, runs on http://localhost:5215; base URL
in `src/environments/environment*.ts`). `design/` holds the source design canvas
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
- `features/<feature>/data/<feature>.store.ts` — feature stores, also
  root-provided so state and the one catalog fetch survive tab switches /
  back-navigation. A store owns *domain* selection (which items, what order,
  active filters); it does **not** build presentation strings.

**Data access is behind an abstract class (DIP).** `core/data/*.repository.ts`
declares an `abstract class` boundary; concrete implementations
(`HttpCollectionsRepository`, or `InMemoryCollectionsRepository` to work
offline) are bound once in `core/core.providers.ts` via `provideCore()`. Nothing
else references a concrete repository.

**HTTP is `fetch` + promises, not `HttpClient`** (keeps RxJS out). HTTP
repositories use `core/api/api-client.ts` (`ApiClient`), which attaches the
bearer token and, on a 401, refreshes once and retries. `AuthStore.refresh()` is
single-flight on purpose: the API treats a reused refresh token as stolen and
revokes every session, so never refresh in parallel. Errors surface as
`ApiError` (`status` 0 = server unreachable; `message` = the API's ProblemDetails
`title`, already in Spanish).

**Presentation mapping happens in the page.** A page injects its store +
`SessionStore`, then a `computed()` maps domain models to a `*.vm.ts` view
model (progress %, gradient string, `isFavorite`). Because the mapping reads the
favourites signal, toggling a favourite re-derives the cards automatically.

**Components split three ways, always.** `templateUrl` + `styleUrls` on every
component — no inline templates/styles (also enforced: `anyComponentStyle`
budget is 4 kB). Feature-local presentational components live under
`features/<feature>/components/`; they take `input.required()`, emit `output()`
intent, and never navigate or mutate a store.

**Routing.** `app.routes.ts`: `/login` (`guestGuard`, provisional screen — no
design yet) and everything else behind `authGuard` → `tabs/tabs.routes.ts`.
`AppComponent` sends the user back to `/login` when the session ends. The `tabs` shell has four
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
