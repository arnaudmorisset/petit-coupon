# Contributing to Petit Coupon

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- Node.js 24+ (see `.nvmrc`)
- npm

## Setup

```bash
nvm use
npm install
npm run dev
```

## Development workflow

This project follows **strict TDD** (Red → Green → Refactor):

1. Write a failing test first
2. Write the minimal code to make it pass
3. Refactor while keeping tests green

Run the full check suite before submitting:

```bash
npm run lint        # Biome linting
npm run check       # TypeScript type-checking
npm run test        # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
```

## Architecture overview

- **Domain layer** (`src/lib/domain/`) — Pure TypeScript classes, no framework dependency. All business logic lives here.
- **PDF layer** (`src/lib/pdf/`) — jsPDF-based vector PDF generation.
- **Stores** (`src/lib/stores/`) — Svelte 5 reactive state using runes.
- **Components** (`src/lib/components/`) — Thin Svelte 5 UI components. No business logic.

See [CLAUDE.md](CLAUDE.md) for the full architecture reference.

## Key conventions

- **No `any`** — use proper types.
- **No `as` assertions** — design code so TypeScript can infer types naturally.
- **OOP with DI** — domain logic in classes, dependencies injected.
- **Value objects are immutable** — use `readonly` properties.
- **Tests are colocated** — `Foo.test.ts` next to `Foo.ts`.
- **I18n** — all user-visible strings use `$t()`. Domain layer stays language-agnostic.
- **CSS colors** — reference `var(--ui-*)` custom properties, never raw hex values.
- **Accessibility** — inputs need `aria-label`, dynamic changes must announce via `StatusStore`.

## Submitting changes

1. Fork the repository and create a branch from `main`.
2. Make your changes following the conventions above.
3. Ensure all checks pass (`lint`, `check`, `test`, `test:e2e`).
4. Open a pull request with a clear description of what and why.

## Reporting bugs

Open an [issue](https://github.com/arnaudmorisset/petit-coupon/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
