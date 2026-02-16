import { describe, expect, it, vi } from "vitest";
import { DownloadService } from "./download-service";

describe("DownloadService", () => {
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
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

		vi.unstubAllGlobals();
	});
});
