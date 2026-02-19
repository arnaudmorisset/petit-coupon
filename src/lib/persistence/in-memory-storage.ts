import type { AppStorage, SessionData } from "./app-storage";

export class InMemoryStorage implements AppStorage {
	private data: SessionData | null = null;

	save(session: SessionData): void {
		this.data = session;
	}

	load(): SessionData | null {
		return this.data;
	}

	clear(): void {
		this.data = null;
	}
}
