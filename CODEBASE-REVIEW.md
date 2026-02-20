# Petit Coupon — Codebase Review Report

## Critical (all resolved)

### 1. ~~Unsafe `JSON.parse` cast in `LocalStorageAdapter` — no shape validation~~ RESOLVED

**What**: `local-storage-adapter.ts:23` returned `JSON.parse(raw)` directly as `SessionData | null` with no schema versioning.

**Resolution**: Added `version: number` field to `SessionData`. `SessionSerializer.serialize()` writes `version: 1`. `SessionSerializer.deserialize()` handles old format (no version) gracefully via existing try-catch resilience. Tests added for old-format data, malformed data, and version field presence.

---

### 2. ~~`DownloadService` revokes object URL synchronously after `click()`~~ RESOLVED

**What**: `download-service.ts` called `URL.revokeObjectURL(url)` immediately after `anchor.click()`.

**Resolution**: Revocation is now deferred with `setTimeout(() => URL.revokeObjectURL(url), 60_000)`. Test verifies revocation does not happen synchronously and fires after the delay.

---

### 3. ~~No error handling in `JsPdfCouponRenderer.render()`~~ RESOLVED

**What**: The entire `render()` method had no try-catch.

**Resolution**: `render()` now delegates to `generatePdf()` wrapped in try-catch. Errors are caught and rethrown as `RenderError` (new domain-specific error class) with the original error as `cause`. Tests verify error wrapping and message propagation.

---

### 4. ~~Silent coupon skip when `positions.indexOf(pos)` returns -1~~ RESOLVED

**What**: `jspdf-renderer.ts` used `coupons[positions.indexOf(pos)]` for cross-array lookup via reference equality.

**Resolution**: Introduced `CouponPlacement` interface and `buildPlacements()` method that zips coupons with positions by index upfront using `.map()`. The rendering loop works with clean typed pairs. `drawCoupon()` now takes `Coupon` (not `Coupon | undefined`), enforced at the type level. If a position is missing for a coupon, `buildPlacements` throws immediately instead of silently producing a blank cell.

---

## Warning

### 5. `as Coupon` casts bypass `noUncheckedIndexedAccess`

**What**: `coupon-collection.ts` uses `as Coupon` on lines 18, 42, 43, and 61 after array index access. `theme-registry.ts:25` does the same. These exist because `noUncheckedIndexedAccess` makes `arr[i]` return `T | undefined`, but the code has already validated the index.

```typescript
// coupon-collection.ts:18
const existing = this.coupons[index] as Coupon;

// theme-registry.ts:25
return this.themes[0] as Theme;
```

**Why it matters**: The project's own CLAUDE.md says "No `as` keyword." These casts are logically safe today, but they set a precedent. If `findIndexOrThrow()` is ever refactored incorrectly, the cast will silence the resulting `undefined`. Five instances across two files.

**Severity**: `warning`

**Suggested direction**: Extract a helper like `getOrThrow(arr, index)` that returns `T` (not `T | undefined`) by throwing internally, avoiding the need for `as`.

---

### 6. `$effect` in `PersistenceManager` has no cleanup function

**What**: `persistence-manager.svelte.ts:46-59` — the `$effect` sets a `setTimeout` but never returns a cleanup function. When the component tree unmounts, the timeout can still fire, writing to storage after the app context is gone.

```typescript
// persistence-manager.svelte.ts:45-59
$effect(() => {
    const _coupons = this.couponStore.coupons;
    const _theme = this.themeStore.selectedTheme;
    if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
        // this could fire after unmount
        this.storage.save(...);
    }, 300);
    // no return () => clearTimeout(...)
});
```

**Why it matters**: Currently a minor leak because the app is a single-page with no route transitions. But if the component tree is ever conditionally rendered (e.g. wrapping the app in an auth gate), the timeout will fire on a stale closure.

**Severity**: `warning`

**Suggested direction**: Return a cleanup function from the `$effect` that clears the timeout.

---

### 7. `PersistenceManager` saves on initial mount

**What**: `persistence-manager.svelte.ts:24-25` — the constructor calls `restore()` then `setupAutoSave()`. The `$effect` immediately runs on mount, reading the just-restored coupons and theme, scheduling a redundant save of the exact data that was just loaded.

**Why it matters**: Every page load triggers an unnecessary `localStorage.setItem` 300ms after boot. Not a correctness bug, but wasteful and could mask real save issues during debugging.

**Severity**: `warning`

**Suggested direction**: Add a `dirty` flag that starts `false` and flips to `true` only when user-initiated mutations happen. Only save when dirty.

---

### 8. Fragile manual state synchronization in `CouponStore`

**What**: `coupon-store.svelte.ts:27-55` — every mutation method (add, remove, editCoupon, moveCoupon, loadCoupons) must manually reassign `this.coupons = this.collection.getAll()` to trigger reactivity. This pattern is repeated 5 times.

```typescript
add(coupon: Coupon): void {
    this.collection.add(coupon);
    this.coupons = this.collection.getAll(); // manual sync
}
```

**Why it matters**: Any future method that mutates the collection but forgets to reassign `this.coupons` will silently break reactivity. There's no compile-time guard.

**Severity**: `warning`

**Suggested direction**: Consider making `coupons` a getter that reads from the collection, or use a private `$state` version counter that forces re-derivation.

---

### 9. Duplicated `PT_TO_MM` constant across 3 files

**What**: The conversion constant `const PT_TO_MM = 25.4 / 72` is defined independently in:
- `src/lib/domain/text-measurer.ts`
- `src/lib/domain/text-scaler.ts` (as `PT_TO_MM`)
- `src/lib/domain/coupon-layout.ts`
- `src/lib/pdf/jspdf-renderer.ts`

**Why it matters**: DRY violation. If the constant's name or usage pattern diverges, the inconsistency is silent. Minor but signals a missing shared constants module.

**Severity**: `warning`

**Suggested direction**: Extract to a shared `units.ts` or `constants.ts` in the domain layer.

---

### 10. Duplicated `borderStyleCss()` function across 3 components

**What**: An identical function appears in:
- `CouponPreview.svelte:21-25`
- `SheetPage.svelte:19-23`
- `ThemePreviewCard.svelte:15-19`

```typescript
function borderStyleCss(style: string): string {
    if (style === "double") return "double";
    if (style === "dashed") return "dashed";
    return "solid";
}
```

**Why it matters**: If a new `BorderStyle` variant is added (e.g. `"dotted"`), all 3 copies must be updated. Easy to miss one.

**Severity**: `warning`

**Suggested direction**: Extract to a shared utility (e.g. `src/lib/utils/border-style.ts` or onto the `Theme` type itself).

---

### 11. No schema versioning in `SessionData`

**What**: `app-storage.ts:7-9` defines `SessionData` without a version field:

```typescript
export interface SessionData {
    readonly selectedThemeId: string;
    readonly coupons: readonly SerializedCoupon[];
}
```

**Why it matters**: When the schema evolves (add fields, rename fields, change coupon structure), old stored data will be parsed into the new shape with missing properties. `SessionSerializer.deserialize()` has a try-catch fallback, but it's a sledgehammer — it drops all data on any parsing failure. A version field enables graceful migration.

**Severity**: `warning`

**Suggested direction**: Add `readonly version: number` to `SessionData`. Write a migration function per version bump.

---

### 12. Hardcoded UI colors scattered across all components

**What**: At least 20+ hex color literals are scattered across component `<style>` blocks: `#3b82f6`, `#e2e8f0`, `#64748b`, `#10b981`, `#cbd5e1`, `#fff`, `#f0fdf4`, `#86efac`, `#fef2f2`, `#fca5a5`, `#475569`, `#f1f5f9`, `#dc2626`, etc. Found in `AppStepper.svelte`, `CouponPreview.svelte`, `CouponForm.svelte`, `CouponList.svelte`, `ClearButton.svelte`, `ThemePreviewCard.svelte`.

**Why it matters**: There's no single source of truth for the app's chrome colors. Implementing a dark mode or design system change requires editing every file. Already today, some colors don't match (different grays used for similar purposes).

**Severity**: `warning`

**Suggested direction**: Define CSS custom properties on `:root` in `app.css` for the UI palette (separate from theme-dependent coupon colors).

---

### 13. Prop drilling through 3 levels

**What**: `App.svelte` creates stores and passes them to `AppStepper` (line 32), which passes them down to `CouponForm`, `CouponList`, `SheetPreview`, `DownloadButton`, `ThemePicker`. The store→AppStepper→child chain is 3 levels, with `AppStepper` acting purely as a pass-through.

**Why it matters**: Adding a new component at any step requires updating the `AppStepper` props interface. The stepper has no business knowing about the coupon or theme stores — it's a layout/navigation component forced to be a data courier.

**Severity**: `warning`

**Suggested direction**: Use Svelte's `setContext`/`getContext` to provide stores at the `App.svelte` level and read them in leaf components.

---

### 14. Missing accessibility: no labels on form inputs

**What**: `CouponForm.svelte:29-38` — the title `<input>` and body `<textarea>` use `placeholder` but have no `<label>` element or `aria-label` attribute. Same in `CouponPreview.svelte:86-96` for edit-mode inputs. `ThemePreviewCard.svelte:22` — theme selection buttons lack descriptive `aria-label` (e.g. "Select Classic theme").

**Why it matters**: Screen readers announce these as unlabeled inputs, making the app unusable for visually impaired users. Placeholders disappear on focus and are not a substitute for labels.

**Severity**: `warning`

**Suggested direction**: Add `<label>` elements (can be visually hidden with `sr-only` class) or `aria-label` attributes.

---

### 15. No loading state or error feedback during PDF generation

**What**: `DownloadButton.svelte` calls `renderer.render()` synchronously in a click handler. There's no loading indicator, no error catch, and the UI freezes during generation. For large coupon sets, this can block the main thread noticeably.

**Why it matters**: Users may click the button multiple times thinking it didn't work, generating multiple PDFs. If rendering fails, there's no feedback — the click just does nothing.

**Severity**: `warning`

**Suggested direction**: Add a loading state (`$state`) that disables the button and shows a spinner during generation. Wrap in try-catch with user-visible error feedback.

---

### 16. `CouponCollection.edit()` accepts `Partial<Coupon>` including `id`

**What**: `coupon-collection.ts:16` — the `updates` parameter is `Partial<Coupon>`, which includes the `id` field. If someone passes `{ id: newId, text: "..." }`, the `id` is silently ignored (the method uses the first `id` param).

```typescript
edit(id: CouponId, updates: Partial<Coupon>): Coupon {
```

**Why it matters**: The type signature is a lie — it suggests you can update the ID, but you can't. This will confuse future developers.

**Severity**: `warning`

**Suggested direction**: Define a narrower type: `type CouponUpdates = { text?: string; title?: string }`.

---

### 17. Zero test coverage for stores, components, and persistence manager

**What**: No test files exist for:
- All Svelte components (`src/lib/components/*.svelte`)
- All store files (`src/lib/stores/*.svelte.ts`)
- `id-generator.ts`, `text-measurer.ts` (EstimatedTextMeasurer), `in-memory-storage.ts`

**Why it matters**: The store layer and component layer are the integration points where most bugs surface. The domain layer is well-tested, but stores (which bridge domain logic and Svelte reactivity) have zero coverage. A broken `$state` sync or incorrect `$effect` dependency would go undetected.

**Severity**: `warning`

**Suggested direction**: Prioritize testing `CouponStore` (verify reactivity contract), `PersistenceManager` (verify save/restore cycle), and `StepperStore` (verify navigation guards).

---

### 18. `PdfDrawingContext` methods return `unknown` instead of `void`

**What**: `pdf-drawing-context.ts:1-23` — all 13 interface methods return `unknown`.

```typescript
export interface PdfDrawingContext {
    moveTo(x: number, y: number): unknown;
    lineTo(x: number, y: number): unknown;
    // ...
}
```

**Why it matters**: This was likely done to structurally match jsPDF's chainable API (which returns `jsPDF`) without importing jsPDF types. It succeeds in avoiding `as` casts, but `unknown` is misleading — callers never use the return value. Anyone reading this interface would wonder if the return value is meaningful.

**Severity**: `warning`

**Suggested direction**: Add a comment explaining the design decision, or use a branded `unknown` type alias (e.g. `type Chainable = unknown`) to signal intent.

---

## Nitpick

### 19. `null` vs `undefined` inconsistency for "absent value"

**What**: The codebase mixes `null` and `undefined` for the same concept:
- `ThemeAssets` (`theme-assets.ts:29-31`): uses `null` for optional assets
- `CouponTextLayoutParams.illustration` (`coupon-layout.ts:15`): uses `undefined`
- `CouponTextLayoutResult.title` (`coupon-layout.ts:26`): uses `null`
- `JsPdfCouponRenderer.assetRenderer` (`jspdf-renderer.ts:21`): uses `null`
- Constructor optionals throughout use `undefined` (TypeScript default)

**Why it matters**: Cognitive overhead when checking for absence. Need to remember which pattern each type uses. Can cause subtle bugs: `theme.assets?.illustration ?? undefined` on `jspdf-renderer.ts:145` converts `null` to `undefined`, which is correct but fragile.

**Severity**: `nitpick`

**Suggested direction**: Standardize on `undefined` for optional values (aligns with TypeScript's optional property syntax `?:`). Use `null` only for explicit "cleared" semantics.

---

### 20. `CouponPreview.svelte` exceeds 150-line guideline (250 lines)

**What**: `CouponPreview.svelte` handles both view mode and edit mode inline, including edit state management, validation logic, theme asset rendering, and all associated CSS.

**Why it matters**: Makes the component harder to scan and test. The edit form (inputs, save/cancel logic) is a distinct concern from the display card.

**Severity**: `nitpick`

**Suggested direction**: Extract the edit form into a `CouponEditForm.svelte` sub-component.

---

### 21. Test isolation: shared mutable counter in `coupon-collection.test.ts`

**What**: `coupon-collection.test.ts:6-10` — a `counter` variable at module scope increments on every `makeCoupon()` call, shared across all tests.

```typescript
let counter = 0;
function makeCoupon(text: string, title: string = ""): Coupon {
    counter++;
    return new Coupon(new CouponId(`id-${String(counter)}`), text, title);
}
```

**Why it matters**: Tests get different IDs depending on execution order. If a test is added or reordered, all downstream IDs shift. Not a correctness issue today, but makes tests fragile and harder to debug.

**Severity**: `nitpick`

**Suggested direction**: Reset `counter = 0` in a `beforeEach()`, or generate IDs from test-local context.

---

### 22. Unused `.card` CSS class in `app.css`

**What**: `src/app.css:38-40` defines `.card { padding: 2em; }` which is never used anywhere.

**Why it matters**: Dead code. Likely a leftover from the Vite template.

**Severity**: `nitpick`

**Suggested direction**: Delete it.

---

### 23. `isValidCoupon` uses `typeof` checks at odds with project philosophy

**What**: `session-serializer.ts:50-55` uses `typeof` for runtime type checking:

```typescript
private isValidCoupon(coupon: SerializedCoupon): boolean {
    return (
        typeof coupon.id === "string" &&
        typeof coupon.title === "string" &&
        typeof coupon.text === "string"
    );
}
```

CLAUDE.md says: "Don't Check Types — Avoid `typeof`/`instanceof` introspection for validation."

**Why it matters**: This is at the system boundary (deserializing untrusted localStorage data), where validation is genuinely needed. The tension is between the project's "Don't Check Types" philosophy and the practical need to validate external data. The check is defensively correct — the conflict is with the stated principle, not with correctness.

**Severity**: `nitpick`

**Suggested direction**: Either update CLAUDE.md to carve out an exception for system boundaries, or rely on the existing try-catch in `deserialize()` to handle malformed data (which already does catch errors).

---

### 24. Inconsistent dependency version pinning strategy

**What**: `package.json` uses `~` for `typescript` but `^` for everything else:
- `typescript: ~5.9.3` (patch only)
- `svelte: ^5.45.2` (minor allowed)
- `vite: ^7.3.1` (minor allowed)

**Why it matters**: Minor inconsistency. Not a bug, but suggests an ad-hoc rather than deliberate strategy.

**Severity**: `nitpick`

**Suggested direction**: Standardize on one approach. `~` (patch only) is safest for reproducible builds.

---

### 25. Magic number `0.5` in double border inset

**What**: `jspdf-renderer.ts:239` — `const inset = theme.borderWidthMm + 0.5;` — the `0.5` has no name or explanation.

**Why it matters**: Anyone modifying the border rendering needs to understand what this value represents (gap between inner and outer border). Without a name, it's opaque.

**Severity**: `nitpick`

**Suggested direction**: Extract as `DOUBLE_BORDER_GAP_MM = 0.5`.

---

## Summary

| Severity | Count | Resolved |
|----------|-------|----------|
| Critical | 4 | 4 |
| Warning  | 14 | 0 |
| Nitpick  | 7 | 0 |
| **Total** | **25** | **4** |

## Top 5 — Fix These Next

1. **#17 — Zero test coverage for stores**: The store layer is where reactivity bugs hide. Even a handful of tests for `CouponStore` and `PersistenceManager` would catch the most common integration failures.

2. **#6 — `$effect` missing cleanup** + **#7 — Saves on initial mount**: Both are in `PersistenceManager`. Adding a cleanup return and a dirty flag prevents leaks and unnecessary writes.

3. **#12 — Hardcoded UI colors**: Centralizing the app chrome palette into CSS custom properties on `:root` would enable future dark mode and reduce scattered hex values.

4. **#13 — Prop drilling through 3 levels**: Moving stores to Svelte context (`setContext`/`getContext`) would decouple `AppStepper` from data it doesn't use.

5. **#8 — Fragile manual state sync in `CouponStore`**: The repeated `this.coupons = this.collection.getAll()` pattern is one forgotten line away from a stale-UI bug.
