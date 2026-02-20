# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Start Vite dev server with HMR
npm run build       # Production build (output: dist/)
npm run preview     # Preview production build locally
npm run check       # Type-check Svelte + TypeScript (svelte-check + tsc)
npm run test        # Run all tests once with Vitest
npm run test:watch  # Run tests in watch mode
npm run lint        # Lint with Biome (check mode, no writes)
npm run lint:fix    # Lint with Biome and apply safe fixes
npm run format      # Format with Biome (writes changes)
```

## Tech Stack

- **Svelte 5** with reactive runes (`$state`, `$props`, etc.) — not the older reactive assignment syntax
- **TypeScript** (strictest config: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, etc.)
- **Vite 7** for bundling and dev server
- **Vitest** for testing (jsdom environment, `@testing-library/svelte`)
- **Biome** for linting and formatting (`.ts`, `.js`, `.json` files only — not `.svelte`)
- **jsPDF** for vector PDF generation (no html2canvas)
- **Node.js 24.13** (see `.nvmrc`)

## Architecture

Vanilla Svelte 5 SPA (no SvelteKit). Entry: `index.html` → `src/main.ts` → `src/App.svelte`.

### Domain Layer (`src/lib/domain/`)
Pure TypeScript classes — zero framework dependency. Each concept is its own file:
- Value objects: `CouponId`, `Coupon` (has `id`, `text`, `title`), `PageFormat`, `Margins`, `CouponDimensions`, `GridPosition`, `LayoutConfig`
- `LayoutEngine` — pure math for computing coupon grid positions across pages
- `CouponCollection` — manages the coupon list. `add(coupon: Coupon)`, `edit(id, updates: Partial<Coupon>)`, `remove`, `move`, `reorder`. No ID generation — caller provides complete `Coupon` instances
- `TextMeasurer` interface + `EstimatedTextMeasurer` — measures text width in mm (char-width ratio based)
- `TextScaler` — computes optimal font size to fit text in a bounding box with word wrapping and force-break
- `CouponTextLayout` — computes title + body text zones for PDF rendering. Uses `TextScaler` to auto-scale each zone independently. Returns `TextBlockLayout` (lines, fontSize, offsetY) for title (nullable) and body. Accepts `illustration` param to reduce text width when an illustration occupies a corner
- `ThemeAssets` types (`theme-assets.ts`) — `SvgPathData`, `PatternAsset`, `OrnamentAsset`, `IllustrationAsset`, `ThemeAssets`. Each theme optionally carries `assets?: ThemeAssets` for decorative SVG elements
- `SheetPreviewData` — groups coupons and grid positions by page number for preview rendering
- `Theme` interface + `DEFAULT_THEME` constant — extended with `ThemeCategory`, `BorderStyle`, title font, accent color, padding, and border style
- `ThemeRegistry` — holds all themes, lookups by ID or category, validates uniqueness
- `themes.ts` — 4 theme definitions (`classic`, `romantic`, `sunshine`, `midnight`) + `ALL_THEMES` array + `THEME_REGISTRY` instance. Each theme wires in its decorative assets (patterns, ornaments, illustrations)

### Asset Library (`src/lib/assets/`)
SVG path data constants for theme decorations. All designs use normalized viewBoxes, scaled at render time:
- `patterns.ts` — `DOTS_PATTERN`, `HEARTS_PATTERN`, `WAVES_PATTERN`, `STARS_PATTERN`
- `ornaments.ts` — `FLOURISH_ORNAMENT`, `LEAF_ORNAMENT`, `GEOMETRIC_ORNAMENT`
- `illustrations.ts` — `ROSE_ILLUSTRATION`, `SUN_ILLUSTRATION`, `MOON_ILLUSTRATION`

### PDF Layer (`src/lib/pdf/`)
- `CouponRenderer` interface → `JsPdfCouponRenderer` implementation
- `PdfDrawingContext` — narrow interface over jsPDF's drawing methods (`moveTo`, `lineTo`, `curveTo`, `fill`, etc.). Enables test mocks to satisfy the type structurally without `as` casts
- `SvgPathRenderer` — translates SVG path `d` strings into `PdfDrawingContext` calls. Supports M/m, L/l, C/c, Q/q (→ cubic), A/a, Z/z commands. Handles tiled patterns with GState opacity and clipping
- `CouponAssetRenderer` — orchestrates drawing all theme assets for a coupon (pattern → corner ornaments → illustration). Depends on `PathRenderer` interface (implemented by `SvgPathRenderer`)
- `FontRegistry` — registers custom TTF fonts into jsPDF (`FontSource` interface for base64-encoded TTFs)
- `fonts/` — embedded TTF font files (Dancing Script, Nunito, Space Grotesk) + `font-data.ts` base64 exports
- `fonts.ts` — pre-built `APP_FONT_REGISTRY` instance with all custom fonts
- `RenderError` — domain-specific error thrown by `JsPdfCouponRenderer` when PDF generation fails. Wraps the original error with a descriptive message
- `DownloadService` — triggers browser file download from a Blob (defers `URL.revokeObjectURL` to avoid revoking before the browser starts the download)
- `JsPdfTextMeasurer` — wraps jsPDF's `getStringUnitWidth()` for precise text measurement during PDF rendering
- `JsPdfCouponRenderer` supports solid/dashed/double border styles, title + body fonts, padding, accent-colored crop marks, auto-scaled text via `CouponTextLayout`, and decorative assets via `CouponAssetRenderer`

### Persistence Layer (`src/lib/persistence/`)
- `AppStorage` interface + `SessionData`/`SerializedCoupon` types — storage contract for session persistence. `SessionData` carries a `version` field for schema evolution
- `LocalStorageAdapter` — thin `localStorage` wrapper implementing `AppStorage` (JSON stringify/parse, no validation)
- `InMemoryStorage` — test double implementing `AppStorage`
- `SessionSerializer` — converts between domain objects (`Coupon`) and `SessionData`. Resilient deserialization: validates theme IDs via `ThemeRegistry`, filters invalid coupons, falls back to defaults on error. Writes `version: 1` on serialize; handles old format (no version) gracefully on deserialize

### Store Layer (`src/lib/stores/`)
- `CouponStore` — Svelte 5 reactive class wrapping `CouponCollection`, uses `$state`. Owns `IdGenerator` and exposes `nextId()`. Methods: `add(coupon)`, `remove`, `editCoupon(id, updates: Partial<Coupon>)`, `moveCoupon`, `loadCoupons`
- `ThemeStore` — Svelte 5 reactive class wrapping `ThemeRegistry`, exposes `selectedTheme` and `selectTheme(id)`
- `StepperStore` — manages 3-step navigation (Theme → Create → Preview & Download), guards step 3 behind coupon existence
- `PersistenceManager` — auto-saves session (theme + coupons) to `AppStorage` via `$effect` with 300ms debounce, restores on construction, exposes `clearSession()`

### UI Layer (`src/lib/components/`)
Thin Svelte 5 components. Components receive stores/data via props. No business logic in components.

- `AppStepper` — 3-step guided flow with step indicators and Back/Next navigation
- `CouponForm` — title input + body textarea to add coupons, enabled when at least one field is non-empty, responsive (stacks vertically on mobile)
- `CouponList` — list of coupons with reorder (up/down) buttons and remove button per coupon
- `CouponPreview` — single coupon card with two-field inline editing (title input + body textarea, explicit Save/Cancel buttons). Shows title in larger/bolder font above body
- `SheetPreview` — WYSIWYG multi-page A4 preview using `LayoutEngine` and `SheetPreviewData`
- `SheetPage` — renders one A4 page with absolutely-positioned coupon cells (percentage-based coordinates), shows title + body
- `ClearButton` — "Start fresh" button with browser `confirm()` dialog, calls `PersistenceManager.clearSession()`
- `DownloadButton` — creates `CouponAssetRenderer(new SvgPathRenderer())` and passes it to `JsPdfCouponRenderer`
- `ThemePicker`, `ThemePreviewCard` — theme selection UI; preview cards show decorative SVG assets
- `SvgPattern`, `SvgOrnament`, `SvgIllustration` — CSS preview components rendering theme assets as inline SVGs (positioned absolutely, pointer-events none). Used in `CouponPreview`, `SheetPage`, and `ThemePreviewCard`
- Theme-dependent styling uses CSS custom properties (`style:--var-name`) set on elements, referenced in `<style>` blocks — not inline `style:property` attributes.
- Responsive breakpoint at 640px (mobile below, desktop above)

## Development Guidelines

- **Strict TDD**: Red → Green → Refactor. Write failing test first.
- **OOP**: Domain logic in proper classes with DI. No business logic in Svelte components.
- **Value objects are immutable** (`readonly` properties).
- **No `any`** — Biome enforces `noExplicitAny`.
- **No non-null assertions** — Biome enforces `noNonNullAssertion`.
- **No `as` keyword** — avoid TypeScript type assertions. Design code so the type system can infer types naturally.
- **Don't Check Types** — follow the pattern from [pragmatic-objects.com](https://book.pragmatic-objects.com/practices/dont-check-types). Avoid `typeof`/`instanceof` introspection for validation. Prefer resilient try-catch over type-checking guards. Keep adapters thin (no validation logic) and let domain-level serializers handle data integrity.
- **Schema versioning** — persisted data (`SessionData`) must carry a `version` field. When the schema evolves, bump the version and handle migration in `SessionSerializer`. Never trust raw `JSON.parse` output blindly — the serializer's try-catch is the runtime safety net.
- **Deferred resource cleanup** — when triggering browser downloads via object URLs, defer `URL.revokeObjectURL` with `setTimeout` to allow the browser to start the download. Never revoke synchronously after `click()`.
- **Error boundaries at I/O layers** — wrap external library calls (jsPDF, font registration, PDF output) in try-catch and throw domain-specific errors (`RenderError`). Callers should handle these errors with user-visible feedback.
- **Pair parallel arrays by construction** — when two arrays are correlated by index (e.g. coupons and positions), zip them into a single array of typed pairs (`CouponPlacement`) upfront. Never use `indexOf` for cross-array lookup — it relies on reference equality and silently fails.

## Testing

Tests are colocated with source files using `*.test.ts`. Use `@testing-library/svelte` for component tests. The test environment is jsdom. Domain classes get thorough unit tests; PDF gets smoke tests.

## Linting & Formatting

Biome handles `.ts`, `.js`, and `.json` files. Svelte files are checked by `svelte-check` and formatted by the Svelte VS Code extension. Do not add `.svelte` files to Biome's scope.
