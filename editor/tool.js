
import * as things from "./things.js";
import * as wheel from "./wheel.js";

let tool = undefined;

let mouseX = 0;
let mouseY = 0;
window.onmousemove = (event) => {
	mouseX = event.clientX;
	mouseY = event.clientY;
}

const e_main = document.getElementById("main");
e_main.onkeyup = (event) => {
	let radial;
	switch (event.key.toLowerCase()) {
		case "a":
			// radial = objs;
			break;
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
	}
	if (radial) {
		
	}
}

function addObj(obj) {

}