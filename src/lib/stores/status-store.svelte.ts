export class StatusStore {
	message: string = $state("");
	private clearTimer: ReturnType<typeof setTimeout> | undefined;

	announce(text: string): void {
		if (this.clearTimer !== undefined) {
			clearTimeout(this.clearTimer);
		}
		this.message = text;
		this.clearTimer = setTimeout(() => {
			this.message = "";
			this.clearTimer = undefined;
		}, 5000);
	}
}
