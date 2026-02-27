import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

window.addEventListener(
	"unhandledrejection",
	(event: PromiseRejectionEvent) => {
		console.error("Unhandled promise rejection:", event.reason);
	},
);

const target = document.getElementById("app");
if (!target) throw new Error("Could not find #app element");

const app = mount(App, { target });

export default app;
