
import * as layout from "./layout.js";
import * as camera from "./camera.js";
import * as wheel from "./wheel.js";
import * as things from "./things.js";
import * as undo from "./undo.js";
import * as binds from "./binds.js";
import * as context from "./context.js";
import * as modifiers from "./modifiers.js";
import tooltip from "../lib/tooltip.js";

wheel.init();
camera.init();
layout.init();

window.wheel = wheel;
window.camera = camera;
window.layout = layout;
window.things = things;
window.undo = undo;
window.context = context;
window.modifiers = modifiers;
window.tooltip = tooltip;

function onContext() {
	const thing = place.at(camera.mouse.x, camera.mouse.y, camera.mouse.z);
	if (!thing) return;
	const el = document.createElement("div");
	{ // Title
		const title = document.createElement("h2");
		title.innerHTML = thing.thing.constructor.name;
		title.title = thing.thing.desc;
		el.appendChild(title);
	}
	{ // Position
		const x = things.createElementInputPos(0, event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			thing.thing.pos.set(thing.pos * 3, value);
		}, thing.thing.pos.get(thing.pos * 3));
		const y = things.createElementInputPos(1, event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			thing.thing.pos.set(thing.pos * 3 + 1, value);
		}, thing.thing.pos.get(thing.pos * 3 + 1));
		const z = things.createElementInputPos(2, event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			thing.thing.pos.set(thing.pos * 3 + 2, value);
		}, thing.thing.pos.get(thing.pos * 3 + 2));
		el.appendChild(x);
		el.appendChild(y);
		el.appendChild(z);
	}
	if (thing.thing.context) {
		el.appendChild(thing.thing.context());
	}
	if (!thing.thing.modifiersAllowed) {
		context.open(el);
		return;
	}
	// const modifiercontainer = document.createElement("div");
	// const modifierslist = thing.thing.modifiers; // this is a set
	// { // Modifiers
	// 	const title = document.createElement("h2");
	// 	title.innerHTML = "Modifiers";
	// 	title.title = "Do things to the things";
	// 	el.appendChild(title);
	// 	for (let modifier of modifierslist) {
	// 		const input = things.createElementInputModifier("Modifier", modifier);
	// 		modifiercontainer.appendChild(input);
	// 		const button = document.createElement("button");
	// 		button.textContent = "Delete";
	// 		button.addEventListener("click", modifierslist.delete.bind(modifierslist, modifier));
	// 		button.addEventListener("click", modifiercontainer.removeChild.bind(modifiercontainer, input));
	// 		button.addEventListener("click", modifiercontainer.removeChild.bind(modifiercontainer, button));
	// 		modifiercontainer.appendChild(button);
	// 	}
	// }
	// {
	// 	let newmodifier = new modifiers.Modifier(modifiers.rotate, modifiers.still);
	// 	let input = things.createElementInputModifier("New Modifier", newmodifier);
	// 	modifiercontainer.appendChild(input);
	// 	const button = document.createElement("button");
	// 	button.textContent = "Add Modifier";
	// 	button.addEventListener("click", () => {
	// 		const deletebutton = document.createElement("button");
	// 		deletebutton.textContent = "Delete";
	// 		deletebutton.addEventListener("click", modifierslist.delete.bind(modifierslist, newmodifier));
	// 		deletebutton.addEventListener("click", modifiercontainer.removeChild.bind(modifiercontainer, input));
	// 		deletebutton.addEventListener("click", modifiercontainer.removeChild.bind(modifiercontainer, deletebutton));
	// 		input.children[0].textContent = "Modifier";
	// 		modifierslist.add(newmodifier);
	// 		newmodifier = new modifiers.Modifier(modifiers.rotate, modifiers.still);
	// 		input = things.createElementInputModifier("New Modifier", newmodifier);
	// 		modifiercontainer.appendChild(deletebutton);
	// 		modifiercontainer.appendChild(input);
	// 		modifiercontainer.appendChild(button);
	// 	});
	// 	modifiercontainer.appendChild(button);
	// }
	el.appendChild(modifiercontainer);
	context.open(el);
}
function deleteThing() {
	const thing = place.at(camera.mouse.x, camera.mouse.y, camera.mouse.z);
	if (!thing) return;
	const before = thing.thing.pos.raw();
	thing.thing.pos.delXYZ(thing.pos);
	if (thing.thing.pos.length === 0) {
		place.del(thing.thing);
		undo.add(
			((thing, before) => { thing.pos.setAll(before); place.add(thing); }).bind(undefined, thing.thing, before),
			place.del.bind(place, thing.thing)
		);
	} else {
		undo.add(
			thing.thing.pos.setAll.bind(thing.thing.pos, before),
			thing.thing.pos.delXYZ.bind(thing.thing.pos, thing.pos),
		);
	}
}

function escape() {
	if (wheel.isOpen) {
		wheel.close();
		return;
	}
	if (context.isOpen) {
		context.close();
		return;
	}
	camera.sel.clear();
}

binds.bind("context", onContext);
binds.bind("z", undo.undo);
binds.bind("y", undo.redo);
binds.bind("click", wheel.toggle);
binds.bind("escape", escape);
binds.bind("enter", wheel.open);
binds.bind("1", wheel.select.bind(undefined, 1));
binds.bind("2", wheel.select.bind(undefined, 2));
binds.bind("3", wheel.select.bind(undefined, 3));
binds.bind("4", wheel.select.bind(undefined, 4));
binds.bind("5", wheel.select.bind(undefined, 5));
binds.bind("6", wheel.select.bind(undefined, 6));
binds.bind("7", wheel.select.bind(undefined, 7));
binds.bind("8", wheel.select.bind(undefined, 8));
binds.bind("9", wheel.select.bind(undefined, 9));
binds.bind("home", camera.home);
binds.bind("backspace", deleteThing);
binds.bind("delete", deleteThing);

window.addEventListener("keydown", event => {
	if (event.target.tagName === "INPUT") return;
	console.log(event.key.toLowerCase())
	if (binds.fire(event.key.toLowerCase()))
		event.preventDefault();
});

const TEST = 1;
if (TEST) {
	let i = 0;
	wheel.data.flat().forEach(thingClass => {
		const x = i % 5 - 1.5;
		const y = Math.floor(i / 5) - 1.5;
		const thing = new thingClass([x * 5, 0, y * 5]);
		place.add(thing);
		++i;
	});
}

window.save = (svg, file) => {
	let out, mime;
	if (svg) {
		tooltip("This isn't implemented yet! Sorry...");
		return;
		out = "temp";
		mime = "image/svg+xml";
	} else {
		out = JSON.stringify(place.toObj());
		mime = "application/json";
	}
	if (file) {
		const blob = new Blob([out], { type: mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${place.name.get()} ${place.author.get()} ${new Date().toGMTString()}.${svg ? "svg" : "json"}`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		tooltip("Place should be downloading!");
	} else {
		navigator.clipboard.writeText(out);
		tooltip("Place copied to clipboard!");
	}
}

window.load = file => {
	if (file) {
		tooltip("This isn't implemented yet! Sorry...");
		return;
	} else {
		navigator.clipboard.readText().then(text => {
			try {
				let out = JSON.parse(text);
				place.fromObj(out);
				tooltip("Place loaded from clipboard");
			} catch (e) {
				tooltip("Failed to parse JSON: " + e.message);
				throw e;
			}
		});
	}
}

window.reset = () => {
	undo.add(
		place.fromObj.bind(place, place.toObj(), false),
		place.clear.bind(place)
	);
	place.clear();
	tooltip("Place reset! (This can be undone)");
}