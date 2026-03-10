# Adding a Theme

This guide walks you through creating a new theme for Petit Coupon.

## Overview

A theme controls the visual appearance of coupons — colors, fonts, borders, and optional decorative SVG assets (background pattern, corner ornaments, illustration). Themes are plain TypeScript objects that satisfy the `Theme` interface.

The system is designed so that both the CSS preview and the PDF output read from the same `Theme` definition automatically.

## Step-by-step

### 1. Choose your visual direction

Decide on:
- A **color palette**: background, border, text, title, and accent colors
- A **font**: pick from the built-in fonts (`Times`, `Helvetica`, `Courier`) or embed a custom TTF (see [Adding a custom font](#adding-a-custom-font) below)
- A **border style**: `"solid"`, `"dashed"`, or `"double"`
- Optional **decorative assets**: background pattern, corner ornaments, illustration

### 2. Create SVG assets (optional)

Assets live in `src/lib/assets/` and are defined as constants with SVG path data. Each asset type has its own file:

| Asset type | File | Interface | Purpose |
| --- | --- | --- | --- |
| Pattern | `patterns.ts` | `PatternAsset` | Tiled background decoration |
| Ornament | `ornaments.ts` | `OrnamentAsset` | Decorative corner elements (mirrored to all 4 corners) |
| Illustration | `illustrations.ts` | `IllustrationAsset` | Larger decorative element in one corner |

Each asset is an object with:
- `path`: an `SvgPathData` (`{ d: string, viewBox: string }`) — the raw SVG path
- Size in mm (`widthMm`, `heightMm` for ornaments/illustrations; `tileWidthMm`, `tileHeightMm` for patterns)
- `opacity` (patterns only) — typically `0.05`–`0.10`
- `position` (illustrations only) — `"top-right"`, `"bottom-left"`, or `"bottom-right"`

**Example pattern:**

```typescript
// src/lib/assets/patterns.ts

export const DIAMONDS_PATTERN: PatternAsset = {
  path: {
    d: "M 5 0 L 10 5 L 5 10 L 0 5 Z",
    viewBox: "0 0 10 10",
  },
  tileWidthMm: 4,
  tileHeightMm: 4,
  opacity: 0.06,
};
```

**Tips for SVG paths:**
- Use a normalized viewBox (start at `0 0`)
- Keep paths simple — they're rendered at small sizes
- Supported SVG commands: `M/m`, `L/l`, `C/c`, `Q/q`, `A/a`, `Z/z`
- You can design in a tool like Figma or Inkscape, then extract the `d` attribute from the exported SVG

All assets are optional. Pass `null` for any slot you don't need.

### 3. Add a theme category (if needed)

The `ThemeCategory` type in `src/lib/domain/theme.ts` is a union:

```typescript
export type ThemeCategory = "romantic" | "friendly" | "playful" | "minimal";
```

If none of the existing categories fit, add yours to this union. Otherwise, reuse an existing one.

### 4. Define the theme

Add your theme definition in `src/lib/domain/themes.ts`:

```typescript
import { DIAMONDS_PATTERN } from "../assets/patterns";
import type { Theme } from "./theme";

export const NATURE_THEME: Theme = {
  id: "nature",
  name: "Nature",
  description: "Fresh and organic",
  category: "friendly",
  backgroundColor: "#f0fdf4",
  borderColor: "#16a34a",
  textColor: "#14532d",
  titleColor: "#166534",
  accentColor: "#4ade80",
  fontFamily: "Helvetica",       // body font
  titleFontFamily: "Helvetica",  // title font (can differ from body)
  borderWidthMm: 0.5,
  borderRadiusMm: 4,
  borderStyle: "solid",
  paddingMm: 5,
  assets: {
    pattern: DIAMONDS_PATTERN,   // or null
    cornerOrnament: null,        // or an OrnamentAsset
    illustration: null,          // or an IllustrationAsset
  },
};
```

Then add it to the `ALL_THEMES` array in the same file:

```typescript
export const ALL_THEMES: readonly Theme[] = [
  CLASSIC_THEME,
  ROMANTIC_THEME,
  SUNSHINE_THEME,
  MIDNIGHT_THEME,
  NATURE_THEME,  // ← add here
];
```

The `ThemeRegistry` picks it up automatically.

### 5. Add translations

Add a description for your theme in both locale files. The key must match your theme's `id`.

**`src/lib/i18n/locales/en.json`:**
```json
{
  "theme": {
    "nature": "Fresh and organic"
  }
}
```

**`src/lib/i18n/locales/fr.json`:**
```json
{
  "theme": {
    "nature": "Frais et naturel"
  }
}
```

The `ThemePreviewCard` component resolves theme descriptions via `$t(`theme.${theme.id}`)`, so this is all you need for the UI to display the translated description.

### 6. Run the checks

```bash
npm run lint        # Biome linting
npm run check       # TypeScript type-checking
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

The existing tests cover theme registry behavior (unique IDs, lookup). If your theme uses new asset types or custom fonts, add targeted unit tests.

## Adding a custom font

If your theme uses a font that isn't built-in (`Times`, `Helvetica`, `Courier`) or already embedded, you need to register it for PDF rendering.

1. **Add the TTF file** to `src/lib/pdf/fonts/` (e.g., `MyFont-Regular.ttf`)

2. **Export the base64 data** in `src/lib/pdf/fonts/font-data.ts`:
   ```typescript
   export const MY_FONT_REGULAR = "/* base64-encoded TTF content */";
   ```
   You can generate the base64 string with:
   ```bash
   base64 -i src/lib/pdf/fonts/MyFont-Regular.ttf | tr -d '\n'
   ```

3. **Register the font** in `src/lib/pdf/fonts.ts`:
   ```typescript
   import { MY_FONT_REGULAR } from "./fonts/font-data";

   const FONT_SOURCES: readonly FontSource[] = [
     // ... existing fonts
     {
       name: "MyFont",
       style: "normal",
       weight: "normal",
       base64: MY_FONT_REGULAR,
     },
   ];
   ```

4. **Use the font name** in your theme's `fontFamily` or `titleFontFamily` field (e.g., `"MyFont"`).

5. **Licensing** — if the font is a third-party font, add its copyright and license information to the `THIRD_PARTY_NOTICES` file at the project root.

## Reference

### Theme interface

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier (used as i18n key and persistence key) |
| `name` | `string` | Display name (English) |
| `description` | `string` | Short description (English, for code reference only — UI uses i18n) |
| `category` | `ThemeCategory` | Grouping category |
| `backgroundColor` | `string` | Hex color for coupon background |
| `borderColor` | `string` | Hex color for coupon border |
| `textColor` | `string` | Hex color for body text |
| `titleColor` | `string` | Hex color for title text |
| `accentColor` | `string` | Hex color for decorative accents (crop marks, etc.) |
| `fontFamily` | `string` | Body text font |
| `titleFontFamily` | `string` | Title text font |
| `borderWidthMm` | `number` | Border width in millimeters |
| `borderRadiusMm` | `number` | Border corner radius in millimeters |
| `borderStyle` | `BorderStyle` | `"solid"`, `"dashed"`, or `"double"` |
| `paddingMm` | `number` | Inner padding in millimeters |
| `assets` | `ThemeAssets` (optional) | Decorative SVG assets |

### Files you'll touch

| What | Where |
| --- | --- |
| SVG assets | `src/lib/assets/{patterns,ornaments,illustrations}.ts` |
| Theme category (if new) | `src/lib/domain/theme.ts` |
| Theme definition | `src/lib/domain/themes.ts` |
| Translations | `src/lib/i18n/locales/{en,fr}.json` |
| Custom font (if any) | `src/lib/pdf/fonts/`, `font-data.ts`, `fonts.ts` |
| Font license (if any) | `THIRD_PARTY_NOTICES` |
