
let mouse = [0, 0, 0];

const e_draw = document.getElementById("draw");
const e_svg  = document.getElementById("svg");

let tool = Types.SELECT;
let sel  = undefined;

const objsdefault = [
	["Noob's Place", 0],
	[0x00AAFF, 0x5C8EED, 0x9CDE5E, 0x505D6B]
];
let objs = [
	["Noob's Place", 0],
	[0x00AAFF, 0x5C8EED, 0x9CDE5E, 0x505D6B]
];

window.onkeydown = event => {
	let k = event.key.toLowerCase();
	if (event.ctrlKey) { switch (k) {
		case "s":
			save();
			return false; // same as event.preventDefault();
		case "l":
			load();
			return false;
		case "e":
			svg();
			return false;
		case "p":
			play();
			return false;
		case "z":
			undo();
			return false;
		case "y":
			redo();
			return false;
		case "t":
			if      (e_palletecontainer.style.display  === "block") e_palletecontainer.style.display = "none";
			else if (e_modifiercontainer.style.display === "block") e_palletecontainer.style.display = "none";
			e_toolboxcontainer.style.display = "block";
			return false;
		case "p":
			if      (e_toolboxcontainer.style.display  === "block") e_toolboxcontainer.style.display = "none";
			else if (e_modifiercontainer.style.display === "block") e_palletecontainer.style.display = "none";
			e_palletecontainer.style.display = "block";
			return false;
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			toolset(undefined, parseInt(event.key));
			break;
		case "0":
			toolset(undefined, Types.SELECT);
			break;
	} } else { switch (k) {
		case "escape":
			if      (e_toolboxcontainer.style.display  === "block") e_toolboxcontainer.style.display  = "none";
			else if (e_palletecontainer.style.display  === "block") e_palletecontainer.style.display  = "none";
			else if (e_modifiercontainer.style.display === "block") e_modifiercontainer.style.display = "none";
			else toolset(Types.SELECT);
			break;
	} }
}
