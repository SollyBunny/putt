
import * as things from "./things.js";
import * as wheel from "./wheel.js";

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
			if (Math.abs(camera.w / 2 - camera.x) < 0.01 && Math.abs(camera.h / 2 - camera.z) / 2 < 0.01) {
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

function addObj(obj) {

}