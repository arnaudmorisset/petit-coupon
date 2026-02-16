export class CouponId {
	readonly value: string;

	constructor(value: string) {
		this.value = value;
	}

	equals(other: CouponId): boolean {
		return this.value === other.value;
	}
}
