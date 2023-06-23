import "./drag.js";
import "./tool.js";
import { Place } from "./thing.js";
import { tool, object, surface } from "./tool.js";

export const place = new Place();

window.attemptClick = (btn, x, y, z) => {
	if (btn == 1) return; // Nothing on middle click
	let toolAttempt;
	if (btn === 2) { // Delete
		toolAttempt = 3;
	} else if (tool === 4) { // Settings -> Select
		toolSet(0);
		toolAttempt = 0;
	} else {
		toolAttempt = tool;
	}
	switch (toolAttempt) {
		case 0: // Select
			if (place.sel === -1) {

			} else {
				place.addPos([x, y, z]);
			}
			break;
		case 1: // Place Object
			place.add(object, [x, y, z]);
			break;
		case 2: // Place Surface
			place.add(surface, [x, y, z]);
			break;
		case 3: // Delete
			break;
	}
}

Object.values(document.getElementsByClassName("dropdown")).forEach(el => {
	el.addEventListener("hover", event => { 
		let i = 0;
		Object.values(event.target.children).forEach(item => {
			item.style.transform = `translateY(calc(${100 * i}% + ${i}vvmin))`;
		});
	}, { passive: true });
});

window.place = place;