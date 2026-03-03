import { describe, expect, it } from "vitest";
import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import { Locale } from "../domain/locale";
import { ThemeRegistry } from "../domain/theme-registry";
import { CLASSIC_THEME, ROMANTIC_THEME } from "../domain/themes";
import { SessionSerializer } from "./session-serializer";

const registry = new ThemeRegistry([CLASSIC_THEME, ROMANTIC_THEME]);

describe("SessionSerializer", () => {
	it("round-trips serialize then deserialize", () => {
		const serializer = new SessionSerializer(registry);
		const coupons = [
			new Coupon(new CouponId("1"), "Body text", "My Title"),
			new Coupon(new CouponId("2"), "Other text"),
		];

		const data = serializer.serialize("classic", coupons, Locale.EN);
		const result = serializer.deserialize(data);

		expect(result.themeId).toBe("classic");
		expect(result.coupons).toHaveLength(2);
		expect(result.coupons[0]?.id.value).toBe("1");
		expect(result.coupons[0]?.title).toBe("My Title");
		expect(result.coupons[0]?.text).toBe("Body text");
		expect(result.coupons[1]?.id.value).toBe("2");
		expect(result.coupons[1]?.title).toBe("");
		expect(result.coupons[1]?.text).toBe("Other text");
	});

	it("preserves a valid theme ID on deserialize", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 1,
			selectedThemeId: "romantic",
			coupons: [],
		});

		expect(result.themeId).toBe("romantic");
	});

	it("falls back to default theme for unknown theme ID", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 1,
			selectedThemeId: "nonexistent",
			coupons: [],
		});

		expect(result.themeId).toBe(registry.getDefault().id);
	});

	it("reconstructs CouponId class instances", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 1,
			selectedThemeId: "classic",
			coupons: [{ id: "abc-123", title: "T", text: "Body" }],
		});

		expect(result.coupons[0]?.id).toBeInstanceOf(CouponId);
		expect(result.coupons[0]?.id.value).toBe("abc-123");
	});

	it("skips invalid coupon entries", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 1,
			selectedThemeId: "classic",
			coupons: [
				{ id: "1", title: "Valid", text: "OK" },
				{ id: "2" } as never, // missing fields
				{ id: "3", title: "Also valid", text: "Good" },
			],
		});

		expect(result.coupons).toHaveLength(2);
		expect(result.coupons[0]?.id.value).toBe("1");
		expect(result.coupons[1]?.id.value).toBe("3");
	});

	it("returns empty array when no coupons", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 1,
			selectedThemeId: "classic",
			coupons: [],
		});

		expect(result.coupons).toHaveLength(0);
	});

	it("preserves title field through serialization", () => {
		const serializer = new SessionSerializer(registry);
		const coupons = [new Coupon(new CouponId("1"), "Body", "Special Title")];

		const data = serializer.serialize("classic", coupons, Locale.EN);

		expect(data.coupons[0]?.title).toBe("Special Title");
		expect(data.coupons[0]?.text).toBe("Body");
	});

	it("includes version 2 in serialized output", () => {
		const serializer = new SessionSerializer(registry);

		const data = serializer.serialize("classic", [], Locale.EN);

		expect(data.version).toBe(2);
	});

	it("deserializes old format data without version field", () => {
		const serializer = new SessionSerializer(registry);
		const oldFormatData = {
			selectedThemeId: "classic",
			coupons: [{ id: "1", title: "T", text: "Body" }],
		} as never;

		const result = serializer.deserialize(oldFormatData);

		expect(result.themeId).toBe("classic");
		expect(result.coupons).toHaveLength(1);
		expect(result.coupons[0]?.text).toBe("Body");
	});

	it("returns defaults for completely malformed data", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize("not an object" as never);

		expect(result.themeId).toBe(registry.getDefault().id);
		expect(result.coupons).toHaveLength(0);
	});

	it("returns defaults when coupons field is not an array", () => {
		const serializer = new SessionSerializer(registry);
		const badData = {
			version: 1,
			selectedThemeId: "classic",
			coupons: "not-an-array",
		} as never;

		const result = serializer.deserialize(badData);

		expect(result.themeId).toBe(registry.getDefault().id);
		expect(result.coupons).toHaveLength(0);
	});

	it("serializes with version 2 and locale", () => {
		const serializer = new SessionSerializer(registry);

		const data = serializer.serialize("classic", [], Locale.FR);

		expect(data.version).toBe(2);
		expect(data.locale).toBe("fr");
	});

	it("deserializes valid locale", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 2,
			selectedThemeId: "classic",
			coupons: [],
			locale: "fr",
		});

		expect(result.locale).toBe(Locale.FR);
	});

	it("falls back to English for unknown locale", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 2,
			selectedThemeId: "classic",
			coupons: [],
			locale: "de",
		});

		expect(result.locale).toBe(Locale.EN);
	});

	it("falls back to English when locale is missing (v1 data)", () => {
		const serializer = new SessionSerializer(registry);

		const result = serializer.deserialize({
			version: 1,
			selectedThemeId: "classic",
			coupons: [],
		});

		expect(result.locale).toBe(Locale.EN);
	});

	it("round-trips locale through serialize and deserialize", () => {
		const serializer = new SessionSerializer(registry);
		const coupons = [new Coupon(new CouponId("1"), "Body", "Title")];

		const data = serializer.serialize("romantic", coupons, Locale.FR);
		const result = serializer.deserialize(data);

		expect(result.locale).toBe(Locale.FR);
		expect(result.themeId).toBe("romantic");
		expect(result.coupons).toHaveLength(1);
	});
});
