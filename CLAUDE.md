# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Start Vite dev server with HMR
npm run build       # Production build (output: dist/)
npm run preview     # Preview production build locally
npm run check       # Type-check Svelte + TypeScript (svelte-check + tsc)
npm run test        # Run tests once with Vitest
npm run test:watch  # Run tests in watch mode
npm run lint        # Lint with Biome (check mode, no writes)
npm run lint:fix    # Lint with Biome and apply safe fixes
npm run format      # Format with Biome (writes changes)
```

## Tech Stack

- **Svelte 5** with reactive runes (`$state`, etc.) — not the older reactive assignment syntax
- **TypeScript** (strictest config: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.)
- **Vite 7** for bundling and dev server
- **Vitest** for testing (jsdom environment, `@testing-library/svelte`)
- **Biome** for linting and formatting (`.ts`, `.js`, `.json` files only — not `.svelte`)
- **Node.js 24.13** (see `.nvmrc`)

## Architecture

This is a vanilla Svelte 5 SPA (no SvelteKit). Entry point is `index.html` → `src/main.ts` → `src/App.svelte`.

- `src/lib/` — Reusable components
- `src/assets/` — Static assets (images, SVGs)
- `src/app.css` — Global styles with CSS custom properties and light/dark scheme support

Components use Svelte 5 single-file format: `<script lang="ts">`, markup, and `<style>` (scoped by default).

## Testing

Tests are colocated with source files using `*.test.ts`. Use `@testing-library/svelte` for component tests. The test environment is jsdom.

## Linting & Formatting

Biome handles `.ts`, `.js`, and `.json` files. Svelte files are checked by `svelte-check` and formatted by the Svelte VS Code extension. Do not add `.svelte` files to Biome's scope.
