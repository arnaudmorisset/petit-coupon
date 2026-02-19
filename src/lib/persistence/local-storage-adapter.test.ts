import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionData } from "./app-storage";
import { LocalStorageAdapter } from "./local-storage-adapter";

function validSession(): SessionData {
	return {
		selectedThemeId: "classic",
		coupons: [
			{ id: "1", title: "Birthday", text: "Happy Birthday!" },
			{ id: "2", title: "", text: "Congratulations" },
		],
	};
}

describe("LocalStorageAdapter", () => {
	let storage: Storage;

	beforeEach(() => {
		const store = new Map<string, string>();
		storage = {
			length: 0,
			clear: vi.fn(() => store.clear()),
			getItem: vi.fn((key: string) => store.get(key) ?? null),
			key: vi.fn(),
			removeItem: vi.fn((key: string) => store.delete(key)),
			setItem: vi.fn((key: string, value: string) => store.set(key, value)),
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("round-trips save then load", () => {
		const adapter = new LocalStorageAdapter(storage);
		const session = validSession();

		adapter.save(session);

		const loaded = adapter.load();
		expect(loaded).toEqual(session);
	});

	it("returns null when no data is stored", () => {
		const adapter = new LocalStorageAdapter(storage);

		const loaded = adapter.load();

		expect(loaded).toBeNull();
	});

	it("returns null when stored data is invalid JSON", () => {
		storage.setItem("petit-coupon-session", "not json {{{");
		const adapter = new LocalStorageAdapter(storage);

		const loaded = adapter.load();

		expect(loaded).toBeNull();
	});

	it("removes data on clear", () => {
		const adapter = new LocalStorageAdapter(storage);
		adapter.save(validSession());

		adapter.clear();

		expect(adapter.load()).toBeNull();
	});

	it("overwrites previous data on save", () => {
		const adapter = new LocalStorageAdapter(storage);
		adapter.save(validSession());

		const newSession: SessionData = {
			selectedThemeId: "romantic",
			coupons: [{ id: "99", title: "New", text: "New coupon" }],
		};
		adapter.save(newSession);

		const loaded = adapter.load();
		expect(loaded).toEqual(newSession);
	});

	it("preserves title field in coupons", () => {
		const adapter = new LocalStorageAdapter(storage);
		const session: SessionData = {
			selectedThemeId: "classic",
			coupons: [{ id: "1", title: "My Title", text: "Body text" }],
		};

		adapter.save(session);
		const loaded = adapter.load();

		expect(loaded?.coupons[0]?.title).toBe("My Title");
	});
});
