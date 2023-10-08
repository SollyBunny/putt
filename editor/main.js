import * as layout from "./layout.js";
import * as drag from "./drag.js";
import * as wheel from "./wheel.js";
import "./tool.js";

layout.init();
drag.init();

const e_wheel = document.getElementById("wheel");
let wheelOpen = false;
export let wheelClickPromise = undefined;
export function onClick(event) {
	console.log("CLICK")
	wheel.toggle();
}