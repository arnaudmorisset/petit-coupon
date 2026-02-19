import type { AppStorage, SessionData } from "./app-storage";

const STORAGE_KEY = "petit-coupon-session";

export class LocalStorageAdapter implements AppStorage {
	private readonly storage: Storage;

	constructor(storage: Storage) {
		this.storage = storage;
	}

	save(session: SessionData): void {
		this.storage.setItem(STORAGE_KEY, JSON.stringify(session));
	}

	load(): SessionData | null {
		const raw = this.storage.getItem(STORAGE_KEY);
		if (raw === null) {
			return null;
		}

		try {
			return JSON.parse(raw);
		} catch {
			return null;
		}
	}

	clear(): void {
		this.storage.removeItem(STORAGE_KEY);
	}
}
