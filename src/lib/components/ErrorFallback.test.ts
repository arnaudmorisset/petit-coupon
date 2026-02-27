import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorFallback from "./ErrorFallback.svelte";

describe("ErrorFallback", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders the error heading", () => {
		render(ErrorFallback, {
			error: new Error("boom"),
			reset: () => {},
		});
		expect(screen.getByText("Something went wrong")).toBeInTheDocument();
	});

	it("has an alert role for accessibility", () => {
		render(ErrorFallback, {
			error: new Error("boom"),
			reset: () => {},
		});
		expect(screen.getByRole("alert")).toBeInTheDocument();
	});

	it("renders try again and reload buttons", () => {
		render(ErrorFallback, {
			error: new Error("boom"),
			reset: () => {},
		});
		expect(
			screen.getByRole("button", { name: /try to recover/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /reload the page/i }),
		).toBeInTheDocument();
	});

	it("calls reset when try again is clicked", async () => {
		const reset = vi.fn();
		render(ErrorFallback, {
			error: new Error("boom"),
			reset,
		});
		await fireEvent.click(
			screen.getByRole("button", { name: /try to recover/i }),
		);
		expect(reset).toHaveBeenCalledOnce();
	});

	it("calls window.location.reload when reload is clicked", async () => {
		const reloadMock = vi.fn();
		Object.defineProperty(window, "location", {
			value: { reload: reloadMock },
			writable: true,
			configurable: true,
		});

		render(ErrorFallback, {
			error: new Error("boom"),
			reset: () => {},
		});
		await fireEvent.click(
			screen.getByRole("button", { name: /reload the page/i }),
		);
		expect(reloadMock).toHaveBeenCalledOnce();
	});
});
