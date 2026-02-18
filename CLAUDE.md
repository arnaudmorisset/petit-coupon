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
- Value objects: `CouponId`, `Coupon`, `PageFormat`, `Margins`, `CouponDimensions`, `GridPosition`, `LayoutConfig`
- `LayoutEngine` — pure math for computing coupon grid positions across pages
- `CouponCollection` — manages the coupon list (add, remove, edit, move, reorder), uses `IdGenerator` (DI) for ID generation
- `TextMeasurer` interface + `EstimatedTextMeasurer` — measures text width in mm (char-width ratio based)
- `TextScaler` — computes optimal font size to fit text in a bounding box with word wrapping and force-break
- `SheetPreviewData` — groups coupons and grid positions by page number for preview rendering
- `Theme` interface + `DEFAULT_THEME` constant — extended with `ThemeCategory`, `BorderStyle`, title font, accent color, padding, and border style
- `ThemeRegistry` — holds all themes, lookups by ID or category, validates uniqueness
- `themes.ts` — 4 theme definitions (`classic`, `romantic`, `sunshine`, `midnight`) + `ALL_THEMES` array + `THEME_REGISTRY` instance

### PDF Layer (`src/lib/pdf/`)
- `CouponRenderer` interface → `JsPdfCouponRenderer` implementation
- `FontRegistry` — registers custom TTF fonts into jsPDF (`FontSource` interface for base64-encoded TTFs)
- `fonts/` — embedded TTF font files (Dancing Script, Nunito, Space Grotesk) + `font-data.ts` base64 exports
- `fonts.ts` — pre-built `APP_FONT_REGISTRY` instance with all custom fonts
- `DownloadService` — triggers browser file download from a Blob
- `JsPdfTextMeasurer` — wraps jsPDF's `getStringUnitWidth()` for precise text measurement during PDF rendering
- `JsPdfCouponRenderer` supports solid/dashed/double border styles, title + body fonts, padding, accent-colored crop marks, and auto-scaled text via `TextScaler`

### Store Layer (`src/lib/stores/`)
- `CouponStore` — Svelte 5 reactive class wrapping `CouponCollection`, uses `$state`. Exposes `add`, `remove`, `editCoupon`, `moveCoupon`
- `ThemeStore` — Svelte 5 reactive class wrapping `ThemeRegistry`, exposes `selectedTheme` and `selectTheme(id)`
- `StepperStore` — manages 3-step navigation (Theme → Create → Preview & Download), guards step 3 behind coupon existence

### UI Layer (`src/lib/components/`)
Thin Svelte 5 components. Components receive stores/data via props. No business logic in components.

- `AppStepper` — 3-step guided flow with step indicators and Back/Next navigation
- `CouponForm` — textarea input to add coupons, responsive (stacks vertically on mobile)
- `CouponList` — list of coupons with reorder (up/down) buttons and remove button per coupon
- `CouponPreview` — single coupon card with inline editing (click to edit, Enter/Escape/blur to save/cancel)
- `SheetPreview` — WYSIWYG multi-page A4 preview using `LayoutEngine` and `SheetPreviewData`
- `SheetPage` — renders one A4 page with absolutely-positioned coupon cells (percentage-based coordinates)
- `DownloadButton`, `ThemePicker`, `ThemePreviewCard` — unchanged from v0.2
- Theme-dependent styling uses CSS custom properties (`style:--var-name`) set on elements, referenced in `<style>` blocks — not inline `style:property` attributes.
- Responsive breakpoint at 640px (mobile below, desktop above)

## Development Guidelines

- **Strict TDD**: Red → Green → Refactor. Write failing test first.
- **OOP**: Domain logic in proper classes with DI. No business logic in Svelte components.
- **Value objects are immutable** (`readonly` properties).
- **No `any`** — Biome enforces `noExplicitAny`.
- **No non-null assertions** — Biome enforces `noNonNullAssertion`. Use type assertions (`as Type`) with safety comments when needed (e.g. after validation in constructors).

## Testing

Tests are colocated with source files using `*.test.ts`. Use `@testing-library/svelte` for component tests. The test environment is jsdom. Domain classes get thorough unit tests; PDF gets smoke tests.

## Linting & Formatting

Biome handles `.ts`, `.js`, and `.json` files. Svelte files are checked by `svelte-check` and formatted by the Svelte VS Code extension. Do not add `.svelte` files to Biome's scope.
