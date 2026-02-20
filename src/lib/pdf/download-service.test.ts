import { afterEach, describe, expect, it, vi } from "vitest";
import { DownloadService } from "./download-service";

describe("DownloadService", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it("does not throw when downloading a blob", () => {
		const service = new DownloadService();
		const blob = new Blob(["test"], { type: "application/pdf" });

		const createObjectURL = vi.fn(() => "blob:mock-url");
		const revokeObjectURL = vi.fn();
		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

		expect(() => {
			service.download(blob, "test.pdf");
		}).not.toThrow();

		expect(createObjectURL).toHaveBeenCalledWith(blob);
	});

	it("defers URL revocation to allow browser to start download", () => {
		vi.useFakeTimers();
		const service = new DownloadService();
		const blob = new Blob(["test"], { type: "application/pdf" });

		const createObjectURL = vi.fn(() => "blob:mock-url");
		const revokeObjectURL = vi.fn();
		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

		service.download(blob, "test.pdf");

		expect(revokeObjectURL).not.toHaveBeenCalled();

		vi.advanceTimersByTime(60_000);

		expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
	});
});
