import "@testing-library/jest-dom/vitest";
import "./src/lib/i18n";
import { waitLocale } from "svelte-i18n";

await waitLocale();
