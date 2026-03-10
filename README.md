# Petit Coupon

[![CI](https://github.com/arnaudmorisset/petit-coupon/actions/workflows/ci.yml/badge.svg)](https://github.com/arnaudmorisset/petit-coupon/actions/workflows/ci.yml)
[![Deploy](https://github.com/arnaudmorisset/petit-coupon/actions/workflows/deploy.yml/badge.svg)](https://github.com/arnaudmorisset/petit-coupon/actions/workflows/deploy.yml)

Printable love coupons, made simple.

Create beautiful love coupons, choose a theme, write your messages, and download a ready-to-print PDF. No sign-up, no ads, completely free. Everything runs in your browser — nothing is sent to a server.

**Live at [petit-coupon.app](https://petit-coupon.app/)**

## Features

- 4 hand-crafted themes with decorative SVG patterns, ornaments, and illustrations
- Auto-scaling text that fits perfectly in each coupon
- High-quality vector PDF output (jsPDF, no html2canvas)
- English/French — toggle language with one click, preference saved automatically
- Session persistence via localStorage
- Accessible — screen reader announcements, reduced motion support, input length limits
- Fully client-side — your data never leaves your browser

## Tech Stack

- **Svelte 5** with reactive runes
- **TypeScript** (strict mode)
- **Vite 7** for bundling
- **Vitest** + Testing Library for tests
- **Biome** for linting and formatting
- **jsPDF** for vector PDF generation
- **svelte-i18n** for internationalization

## Getting Started

```bash
# Prerequisites: Node.js 24+ (see .nvmrc)
nvm use

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (output: `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run check` | Type-check Svelte + TypeScript |
| `npm run test` | Run all tests once |
| `npm run lint` | Lint with Biome |
| `npm run format` | Format with Biome |

## Architecture

Vanilla Svelte 5 SPA (no SvelteKit). Domain logic lives in pure TypeScript classes (`src/lib/domain/`), PDF rendering in `src/lib/pdf/`, and thin UI components in `src/lib/components/`. See [CLAUDE.md](CLAUDE.md) for full architecture details.

## License

[MIT](LICENSE)
