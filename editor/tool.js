
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
		default:
			return;
	}
	event.preventDefault();
}

function addObj(obj) {

}