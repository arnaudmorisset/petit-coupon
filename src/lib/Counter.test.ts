import { fireEvent, render, screen } from "@testing-library/svelte";
import { expect, test } from "vitest";
import Counter from "./Counter.svelte";

test("renders with initial count of 0", () => {
	render(Counter);
	expect(screen.getByRole("button")).toHaveTextContent("count is 0");
});

test("increments count on click", async () => {
	render(Counter);
	const button = screen.getByRole("button");

	await fireEvent.click(button);

	expect(button).toHaveTextContent("count is 1");
});
