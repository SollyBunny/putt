import * as layout from "./layout.js";
import * as camera from "./camera.js";
import * as wheel from "./wheel.js";
import "./tool.js";
import "./things.js"

wheel.init();
camera.init();
layout.init();

export function onClick(event) {
	console.log("CLICK")
	wheel.toggle();
}