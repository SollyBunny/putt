
import { TYPESURFACESTART, TYPES, TYPESNAMES, TYPESDESC, MODIFIERS, MODIFIERNAMES, MODIFIERDESCS } from "./def.js";

export let tool = 0;
export let object = 0;
export let surface = 0;
export let sel = -1;

const c_menu = document.getElementById("menu").children;

// Set the ID of a tool
function toolSet(id) {
	if (tool === id) return;
	c_menu[tool].style.display = "none";
	tool = id;
	c_menu[tool].style.display = (id === 1 || id === 2 ) ? "flex" : "block";
}

function objectSet(id) {
	if (id > TYPESURFACESTART) {
		surface = id;
		toolSet(2); // Just to make sure
	} else {
		object = id;
		toolSet(1); // Just to make sure
	}
	console.log(id)
}

// Populate the menus
for (let i = 0; i < TYPESNAMES.length; ++i) {
	const id = (i < TYPESURFACESTART ? "object" : "surface") + i;
	const inp = document.createElement("input");
	inp.type = "radio";
	inp.name = "object";
	inp.id = id;
	const lbl = document.createElement("label");
	lbl.setAttribute("for", id);
	lbl.title = TYPESDESC[i];
	lbl.onclick = () => {
		objectSet(i);
	}
	const btn = document.createElement("button");
	btn.textContent = TYPESNAMES[i];
	// el.style.backgroundImage = `url(assets/imgs/${TYPESNAMES[i].toLowerCase()}.svg)`
	lbl.appendChild(btn);
	if (i < TYPESURFACESTART) {
		c_menu[1].appendChild(inp);
		c_menu[1].appendChild(lbl);
	} else {
		c_menu[2].appendChild(inp);
		c_menu[2].appendChild(lbl);
	}
}

// For input events
window.toolSet = toolSet;