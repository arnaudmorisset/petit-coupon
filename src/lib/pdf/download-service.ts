const REVOKE_DELAY_MS = 60_000;

export class DownloadService {
	download(blob: Blob, filename: string): void {
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = filename;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
	}
}
