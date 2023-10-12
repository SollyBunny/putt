import * as layout from "./layout.js";
import * as camera from "./camera.js";
import * as wheel from "./wheel.js";
import * as things from "./things.js";

wheel.init();
camera.init();
layout.init();

window.wheel = wheel;
window.camera = camera;
window.layout = layout;

export function onClick(event) {
	wheel.toggle();
}

export function onThing(thingClass) {
	const thing = new thingClass([camera.mouse.x, camera.mouse.y, camera.mouse.z]);
	place.add(thing);
	place.edit(thing);
}

const e_main = document.getElementById("main");
document.onkeyup = event => {
	if (event.target.tagName === "INPUT") return;
	switch (event.key.toLowerCase()) {
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			wheel.select(parseInt(event.key));
			break;
		case "escape":
			wheel.close();
			break;
		case "home":
			if (Math.abs(camera.w / 2 - camera.x) < 0.05 && Math.abs(camera.h / 2 - camera.z) / 2 < 0.05) {
				camera.panzoom.smoothZoomAbs(
					camera.w / 2,
					camera.h / 2,
					1
				);
			} else {
				camera.panzoom.smoothMoveTo(
					camera.w / 2,
					camera.h / 2,
				);
			}
			break;
		default:
			return;
	}
	event.preventDefault();
}

const TEST = 1;
if (TEST) {
	let i = 0;
	wheel.data.flat().forEach(thingClass => {
		const x = i % 5;
		const y = Math.floor(i / 5);
		const thing = new thingClass([x * 5, 0, y * 5]);
		place.add(thing);
		++i;
	});
}