import * as layout from "./layout.js";
import * as drag from "./drag.js";
import * as wheel from "./wheel.js";
import "./tool.js";
import "./things.js"

layout.init();
drag.init();

export function onClick(event) {
	console.log("CLICK")
	wheel.toggle();
}