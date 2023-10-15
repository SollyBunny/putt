
import * as camera from "../camera.js";
import * as modifiers from "../modifiers.js";

export function createElementSVG(type) {
	return document.createElementNS("http://www.w3.org/2000/svg", type);
}
let createElementInputUUID = 0;
export function createElementInput(type, title, desc, value, oninput) {
	const el = document.createElement("div");
	el.classList.add("combinedinput");
	el.title = desc;
	const id = `_input${createElementInputUUID}`;
	createElementInputUUID++;
	{ // input
		const input = document.createElement("input");
		input.type = type;
		input.value = value;
		input.placeholder = value;
		input.id = id;
		input.step = "any";
		input.addEventListener("input", oninput);
		el.appendChild(input);
	}
	{ // label
		const label = document.createElement("label");
		label.setAttribute("for", id);
		label.textContent = title;
		el.appendChild(label);
	}
	return el;
}
const createElementPosNames = ["X", "Y", "Z"];
const createElementPosDescs = [
	"X Position (left / right)",
	"Y Position (up / down)",
	"Z Position (forward / backward)",
];
export function createElementInputPos(axis, oninput, value) {
	return createElementInput("input", createElementPosNames[axis], createElementPosDescs[axis], value, oninput);
}
export function createElementInputMenu(title, desc, values, value, oninput) {
	const el = document.createElement("div");
	el.classList.add("combinedinput");
	el.title = desc;
	const id = `_input${createElementInputUUID}`;
	createElementInputUUID++;
	{ // input
		const select = document.createElement("select");
		select.value = value;
		select.id = id;
		for (const keypair of values) {
			const option = document.createElement("option");
			option.value = keypair[0];
			option.textContent = keypair[1];
			select.appendChild(option);
		}
		select.addEventListener("input", oninput);
		el.appendChild(select);
	}
	{ // label
		const label = document.createElement("label");
		label.setAttribute("for", id);
		label.textContent = title;
		el.appendChild(label);
	}
	return el;
}
export function createElementInputModifier(name, modifier) {
	const el = document.createElement("div");
	{
		const title = document.createElement("h3");
		title.textContent = name;
		el.appendChild(title);
	}
	{
		const type = createElementInputMenu("Type", "What to do to the thing", [
			[0, "Rotate"], [1, "Scale"], [2, "Move"]
		], modifier.type.value, event => {
			modifier.type.value = parseInt(event.target.value);
		});
		el.appendChild(type);
	}
	{

		console.log(modifier.timing.value, modifier.timing, modifier.penis)
		modifier.penis = "hi"
		console.log(modifier.timing.value, modifier.timing, modifier.penis)
		const timing = createElementInputMenu("Timing", "How time affects the modifier", [
			[0, "Still (x = 0)"],
			[1, "Linear (x = t)"],
			[2, "Ease (x = t^2)"]
		], modifier.timing.value, event => {
			console.log(modifier.timing.value, modifier.timing, modifier.penis)
			modifier.timing.value = parseInt(event.target.value);
			// new modifiers.Timing(parseInt(event.target.value));
			console.log(modifier.timing.value, modifier.timing, modifier.penis)
		});
		el.appendChild(timing);
	}
	{
		const x = createElementInputPos(0, event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			modifier.pos[0] = value;
		}, modifier.pos[0]);
		const y = createElementInputPos(1, event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			modifier.pos[1] = value;
		}, modifier.pos[1]);
		const z = createElementInputPos(2, event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			modifier.pos[2] = value;
		}, modifier.pos[2]);
		el.appendChild(x);
		el.appendChild(y);
		el.appendChild(z);
	}
	return el;
}
class Pos {
	constructor(pos, update) {
		this.data = pos || [0, 0, 0];
		this.update = update;
	}
	get length() {
		return this.data.length;
	}
	get(n) {
		return this.data[n];
	}
	set(n, value) {
		if (this.data[n] === value) return value;
		this.data[n] = value;
		this.update();
		return value;
	}
	setAll(data) {
		this.data = data;
		this.update();
	}
	delXYZ(n) {
		this.data.splice(n * 3, 3);
		this.update();
	}
	getXYZ(n) {
		return [this.data[n * 3], this.data[n * 3 + 1], this.data[n * 3 + 2]];
	}
	setXYZ(n, x, y, z) {
		if (
			this.data[n * 3    ] !== x ||
			this.data[n * 3 + 1] !== y ||
			this.data[n * 3 + 2] !== z
		) {
			this.data[n * 3    ] = x;
			this.data[n * 3 + 1] = y;
			this.data[n * 3 + 2] = z;
			this.update();
		}
	}
	insXYZ(n, x, y, z) {
		this.data.splice(n * 3, 0, x, y, z);
		this.update();
	}
	raw() {
		return this.data.slice();
	}
}

export class Properties {
	constructor(callback) {
		this.callback = callback;
		this.data = [];
	}
	set(key, value) {
		if (this.data[key] === value) return value;
		this.data[key] = value;
		this.callback();
		return value;
	}
	get(key) {
		return this.data[key];
	}
	get length() {
		return this.data.length;
	}
}

export class Thing {
	constructor(pos) {
		this.pos = new Pos(pos, this.elUpdateCallback.bind(this));
		this.el = this.elCreate();
		this.modifiers = new Set();
		this.modifiersAllowed = true;
		this.properties = new Properties(this.elUpdateCallback.bind(this));
		if (this.el) {
			this.el.title = this.desc;
			this.elUpdate(this.el);
			this.elUpdateLayer(this.el);
		}
		
	}
	clone() {
		return new this.constructor(this.pos.raw());
	}
	elUpdateLayer(el) {
		// average Y value
		let avg = 0;
		let hit = false;
		for (let i = 0; i < this.pos.length; i += 3) {
			const thisy = this.pos.get(i + 1)
			avg += thisy;
			if (thisy === camera.mouse.y) hit = true;
		}
		avg /= this.pos.length / 3;
		// set
		const dif = Math.abs(avg - camera.mouse.y);
		el.style.opacity = 0.8 - Math.min(0.2, dif / 10);
		el.setAttribute("stroke-width", 0.1 - Math.min(0.05, dif / 100));
		if (hit)
			el.style.filter = "";
		else
			el.style.filter = "grayscale(1)";
	}
	elUpdateCallback() {
		if (this.pos.length === 0) return;
		this.elUpdate(this.el);
	}
	elCreate() {
		const el = createElementSVG("text");
		el.setAttribute("text-anchor", "middle");
		el.setAttribute("dominant-baseline", "central");
		el.setAttribute("fill", "var(--decor)");
		el.textContent = this.constructor.name;
		this.elUpdate(el);
		return el;
	}
	elUpdate(el) {
		el.setAttribute("transform", `translate(${this.pos.get(0)} ${this.pos.get(2)})`);
	}
	elMoveUp(el) {
		el.parentElement.appendChild(el);
	}
	elMoveDown(el) {
		el.parentElement.insertBefore(el, el.parentElement.firstChild);
	}
}