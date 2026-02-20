export interface SerializedCoupon {
	readonly id: string;
	readonly title: string;
	readonly text: string;
}

export interface SessionData {
	readonly version: number;
	readonly selectedThemeId: string;
	readonly coupons: readonly SerializedCoupon[];
}

export interface AppStorage {
	save(session: SessionData): void;
	load(): SessionData | null;
	clear(): void;
}
