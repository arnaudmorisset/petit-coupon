# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (output: dist/)
npm run preview   # Preview production build locally
npm run check     # Type-check Svelte + TypeScript (svelte-check + tsc)
```

No test runner is configured yet. No linter or formatter (ESLint/Prettier) is set up.

## Tech Stack

- **Svelte 5** with reactive runes (`$state`, etc.) — not the older reactive assignment syntax
- **TypeScript** (strict mode, JS also type-checked via `checkJs`)
- **Vite 7** for bundling and dev server
- **Node.js 24.13** (see `.nvmrc`)

## Architecture

This is a vanilla Svelte 5 SPA (no SvelteKit). Entry point is `index.html` → `src/main.ts` → `src/App.svelte`.

- `src/lib/` — Reusable components
- `src/assets/` — Static assets (images, SVGs)
- `src/app.css` — Global styles with CSS custom properties and light/dark scheme support

Components use Svelte 5 single-file format: `<script lang="ts">`, markup, and `<style>` (scoped by default).
