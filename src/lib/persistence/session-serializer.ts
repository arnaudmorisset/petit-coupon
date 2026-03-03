import { Coupon } from "../domain/coupon";
import { CouponId } from "../domain/coupon-id";
import { Locale } from "../domain/locale";
import type { ThemeRegistry } from "../domain/theme-registry";
import type { SerializedCoupon, SessionData } from "./app-storage";

export interface DeserializedSession {
	readonly themeId: string;
	readonly coupons: readonly Coupon[];
	readonly locale: Locale;
}

export class SessionSerializer {
	private readonly registry: ThemeRegistry;

	constructor(registry: ThemeRegistry) {
		this.registry = registry;
	}

	serialize(
		themeId: string,
		coupons: readonly Coupon[],
		locale: Locale,
	): SessionData {
		return {
			version: 2,
			selectedThemeId: themeId,
			coupons: coupons.map((c) => ({
				id: c.id.value,
				title: c.title,
				text: c.text,
			})),
			locale: locale.value,
		};
	}

	deserialize(data: SessionData): DeserializedSession {
		try {
			const themeId = this.resolveThemeId(data.selectedThemeId);
			const coupons = data.coupons
				.filter((c) => this.isValidCoupon(c))
				.map((c) => new Coupon(new CouponId(c.id), c.text, c.title));
			const locale = Locale.resolve(data.locale);
			return { themeId, coupons, locale };
		} catch {
			return {
				themeId: this.registry.getDefault().id,
				coupons: [],
				locale: Locale.DEFAULT,
			};
		}
	}

	private resolveThemeId(id: string): string {
		try {
			this.registry.getById(id);
			return id;
		} catch {
			return this.registry.getDefault().id;
		}
	}

	private isValidCoupon(coupon: SerializedCoupon): boolean {
		return (
			typeof coupon.id === "string" &&
			typeof coupon.title === "string" &&
			typeof coupon.text === "string"
		);
	}
}
