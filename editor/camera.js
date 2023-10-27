
import * as undo from "./undo.js";
import * as binds from "./binds.js";
import * as context from "./context.js";
import * as wheel from "./wheel.js";
import { createElementSVG } from "./things/thing.js";

const MOUSELOCKDEFAULT = 0.5;
const ZOOMINITIAL = 200;
const ZOOMMAX = 25 * ZOOMINITIAL;
const ZOOMMIN = 0.01 * ZOOMINITIAL;

const e_main = document.getElementById("main"); // get a lot of elements
const e_draw = document.getElementById("draw");
const e_ptrs = document.getElementById("ptrs");
const e_sels = document.getElementById("sels");
const e_selr = document.getElementById("selr");
const e_ptr1 = document.getElementById("ptr1");
const e_ptr2 = document.getElementById("ptr2");
const e_circ = document.getElementById("circ");
const e_lins = document.getElementById("lins");
const e_linx = document.getElementById("linx");
const e_linz = document.getElementById("linz");
const e_linh = document.getElementById("linh");
const e_txtx = document.getElementById("txtx");
const e_txtz = document.getElementById("txtz");
const e_txth = document.getElementById("txth");

const e_scale = document.getElementById("scale");
const e_scalezoom = document.getElementById("scalezoom");
const e_scaledis = document.getElementById("scaledis");
const e_scaleedge = document.getElementById("scaleedge");
const e_scaleline = document.getElementById("scaleline");

const e_mouselock = document.getElementById("mouselock");

const can = document.getElementById("background");
const ctx = can.getContext("2d");

function selectionPointerDown(event) {
	if (event.button !== 0) return;
	if (event.ctrlKey) {
		if (event.target.desc.thing.pos.length > 3) {
			event.target.desc.thing.pos.insXYZ(event.target.desc.pos, mouse.x, mouse.y, mouse.z);
			undo.add(
				event.target.desc.thing.pos.delXYZ.bind(event.target.desc.thing.pos, event.target.desc.pos),
				event.target.desc.thing.pos.insXYZ.bind(event.target.desc.thing.pos, mouse.x, mouse.y, mouse.z)
			);
		} else {
			const newthing = event.target.desc.thing.clone();
			event.target.desc.thing = place.add(newthing);
			undo.add(
				place.del.bind(place, event.target.desc.thing),
				place.add.bind(place, newthing)
			);
		}
	}
	event.target.desc.dragStart = event.target.desc.thing.pos.getXYZ(event.target.desc.pos);
	event.target.setPointerCapture(event.pointerId);
	mouseOld.x = (mouseReal.x - x) / scale;
	mouseOld.y = mouse.y;
	mouseOld.z = (mouseReal.y - z) / scale;
}
function seelctionPointerMove(event) {
	if (!event.target.hasPointerCapture(event.pointerId)) return;
	const oldX = mouse.x;
	const oldZ = mouse.z;
	mouseReal.x = event.layerX;
	mouseReal.y = event.layerY;
	updateMouse();
	for (const desc of sel) {
		desc.thing.pos.translate(desc.pos, mouse.x - oldX, 0, mouse.z - oldZ);
		sel.update(desc);
	}
}
function selectionPointerUp(event) {
	event.target.releasePointerCapture(event.pointerId);
	if (event.target.desc.dragStart) {
		undo.add(
			event.target.desc.thing.pos.setXYZ.bind(event.target.desc.thing.pos, event.target.desc.pos, ...event.target.desc.dragStart),
			event.target.desc.thing.pos.setXYZ.bind(event.target.desc.thing.pos, event.target.desc.pos, mouse.x, mouse.y, mouse.z),
		);
	}
}
class Selection {
	constructor() {
		this.data = new Set();
	}
	clear() {
		for (const desc of this.data)
			this.remove(desc);
		return this.data.clear();
	}
	add(desc) {
		if (!desc.el) {
			desc.el = createElementSVG("circle");
			desc.el.desc = desc;
			desc.el.addEventListener("pointerdown", selectionPointerDown);
			desc.el.addEventListener("pointermove", seelctionPointerMove);
			desc.el.addEventListener("pointerup", selectionPointerUp);
			desc.el.addEventListener("pointercancel", selectionPointerUp);
		}
		this.update(desc);
		e_sels.appendChild(desc.el);
		return this.data.add(desc);
	}
	remove(desc) {
		e_sels.removeChild(desc.el);
		return this.data.delete(desc);
	}
	toggle(desc) {
		if (this.has(desc))
			this.remove(desc);
		else
			this.add(desc);
	}
	has(desc) {
		return this.data.has(desc);
	}
	update(desc) {
		if (!desc) {
			for (const desc of this.data)
				this.update(desc);
			return;
		}
		if (!desc.el) return;
		const pos = desc.thing.pos.getXYZ(desc.pos);
		desc.el.setAttribute("cx", pos[0] * scale);
		desc.el.setAttribute("cy", pos[2] * scale);
		return desc;
	}
	get size() {
		return this.data.size;
	}
	// iterator
	[Symbol.iterator]() {
		return this.data[Symbol.iterator]();
	}

}

export const mouseReal = {x: 0, y: 0};
export const mouse = {x: 0, y: 0, z: 0};
export const mouseOld = {x: 0, y: 0, z: 0};
export const sel = new Selection();
export let x = 0;
export let y = 0;
export let z = 0;
let click = false;
let selr = false;

export let scale = 1;
export let w = can.width;
export let h = can.height;
let myPanzoom = undefined;
export { myPanzoom as panzoom };

export function toScreenX(a) { // client x -> screen x
	return Math.round(a * scale + x);
}
export function toScreenZ(a) { // client z -> screen z
	return Math.round(a * scale + z);
}
export function toScreenTransform(xIn, zIn) { // format client x, z to a transform
	return `translate(${toScreenX(xIn)}px, ${toScreenZ(zIn)}px)`;
}
export function toPadString(n) { // format a number as a padded fixed number
	return String(Math.round(n * 100) / 100).padStart(2, " ");
}

export function render() {
	// Sels
	e_sels.style.transform = `translate(${x}px, ${z}px)`;
	sel.update();
	// Set grid line size
	let size = scale;
	while (size < 30) size *= 10;
	while (size > 70) size /= 10;
	// Set zoom UI
	let sizezoom = 1;
	while (sizezoom * scale > 600) sizezoom /= 2;
	while (sizezoom * scale < 300) sizezoom *= 2;
	e_scalezoom.textContent = toPadString(scale / ZOOMINITIAL) + "x";
	e_scaledis.textContent = toPadString(sizezoom) + "u";
	e_scaleedge.setAttribute("transform", `translate(${-sizezoom * scale} 0)`);
	// Setup ctx
	ctx.clearRect(0, 0, w, h);
	ctx.lineWidth = 1;
	// Minor Grid Lines
	ctx.strokeStyle = "#555";
	ctx.beginPath();
	// (<axis> < 0 ? Math.floor : Math.ceil)` is because it must round away from 0
	for (let n = x % size, i = (x < 0 ? Math.floor : Math.ceil)(-x / size); n < w; n += size, ++i) {
		// Minor X Lines
		if (i % 5 === 0) continue; // skip Minor X Lines
		ctx.moveTo(n, 0);
		ctx.lineTo(n, h);
	}
	for (let n = z % size, i = (z < 0 ? Math.floor : Math.ceil)(-z / size); n < h; n += size, ++i) {
		// Minor Y Lines
		if (i % 5 === 0) continue; // skip Minor Y Lines
		ctx.moveTo(0, n);
		ctx.lineTo(w, n);
	}
	ctx.stroke();
	// Major Grid Lines
	size *= 5;
	ctx.strokeStyle = "#aaa";
	ctx.beginPath();
	for (let n = x % size, i = (x < 0 ? Math.floor : Math.ceil)(-x / size); n < w; n += size, ++i) {
		// Major X Lines
		ctx.moveTo(n, 0);
		ctx.lineTo(n, h);
	}
	for (let n = z % size, i = (z < 0 ? Math.floor : Math.ceil)(-z / size); n < h; n += size, ++i) {
		// Major Y Lines
		ctx.moveTo(0, n);
		ctx.lineTo(w, n);
	}
	ctx.stroke();
	// Middle Grid Lines
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(x, 0); // X
	ctx.lineTo(x, h);
	ctx.moveTo(0, z); // Y
	ctx.lineTo(w, z);
	ctx.stroke();
};
export function resize() {
	const bounding = e_main.parentElement.getBoundingClientRect();
	can.width = w = bounding.width;
	can.height = h = bounding.height;
	render();
};
let updateMouseLast = Date.now();
let updateMouseLastY = undefined;
export function updateMouse() {
	// Handle updated y value
	if (updateMouseLastY !== mouse.y) {
		updateMouseLastY = mouse.y;
		// Update all opacities
		place.things.forEach(thing => {
			thing.elUpdateLayer(thing.el);
		})
	}
	// Check for too fast updates
	const now = Date.now();
	if (now - updateMouseLast < 10) return; // only continue if it has been more than 10ms than the last update
	updateMouseLast = now;
	mouse.x = (mouseReal.x - x) / scale;
	mouse.z = (mouseReal.y - z) / scale;
	const mouselock = getMouselock();
	mouse.x = Math.round(mouse.x / mouselock) * mouselock;
	mouse.z = Math.round(mouse.z / mouselock) * mouselock;
	// Primary Pointer
	e_ptr1.style.transform = toScreenTransform(mouse.x, mouse.z);
	e_ptr1.children[1].textContent = `${toPadString(mouse.x)}, ${toPadString(mouse.y)}, ${toPadString(mouse.z)}`;
	// Old / Secondary Pointer
	const hyp = Math.sqrt((mouse.x - mouseOld.x) ** 2 + (mouse.z - mouseOld.z) ** 2);
	if (hyp < 100 / scale) {
		e_ptr2.children[1].textContent = "";
	} else {
		e_ptr2.children[1].textContent = `${toPadString(mouseOld.x)}, ${toPadString(mouseOld.y)}, ${toPadString(mouseOld.z)}`;
	}
	e_ptr2.style.transform = toScreenTransform(mouseOld.x, mouseOld.z);
	if (selr) {
		e_circ.style.display = "none";
		e_linx.style.display = "none";
		e_linz.style.display = "none";
		e_linh.style.display = "none";
		e_txtx.style.display = "none";
		e_txtz.style.display = "none";
		e_txth.style.display = "none";
		e_selr.style.display = "block";
		e_selr.setAttribute("d", `M${toScreenX(mouseOld.x)} ${toScreenZ(mouseOld.z)} H${toScreenX(mouse.x)} V${toScreenZ(mouse.z)} H${toScreenX(mouseOld.x)} V${toScreenZ(mouseOld.z)}`);
	} else {
		e_selr.style.display = "none";
		e_circ.style.display = "block";
		e_linx.style.display = "block";
		e_linz.style.display = "block";
		e_linh.style.display = "block";
		e_txtx.style.display = "block";
		e_txtz.style.display = "block";
		e_txth.style.display = "block";
		// Circle
		e_circ.setAttribute("r", hyp * scale);
		e_circ.style.transform = toScreenTransform(mouseOld.x, mouseOld.z);
		// Hyp
		if (hyp < 50 / scale) {
			e_txth.textContent = "";
		} else {
			e_txth.style.transform = toScreenTransform((mouse.x + mouseOld.x) / 2, (mouse.z + mouseOld.z) / 2);
			e_txth.textContent = toPadString(hyp);
		}
		e_linh.setAttribute("x1", toScreenX(mouseOld.x));
		e_linh.setAttribute("y1", toScreenZ(mouseOld.z));
		e_linh.setAttribute("x2", toScreenX(mouse.x));
		e_linh.setAttribute("y2", toScreenZ(mouse.z));
		// Line X
		const xDis = Math.abs(mouse.x - mouseOld.x);
		if (xDis < 50 / scale) {
			e_txtx.textContent = "";
		} else {
			e_txtx.style.transform = toScreenTransform((mouse.x + mouseOld.x) / 2, mouseOld.z);
			e_txtx.textContent = toPadString(xDis);
		}
		e_linx.setAttribute("x1", toScreenX(mouseOld.x));
		e_linx.setAttribute("y1", toScreenZ(mouseOld.z));
		e_linx.setAttribute("x2", toScreenX(mouse.x));
		e_linx.setAttribute("y2", toScreenZ(mouseOld.z));
		// Line Z
		const zDis = Math.abs(mouse.z - mouseOld.z);
		if (zDis < 50 / scale) {
			e_txtz.textContent = "";
		} else {
			e_txtz.style.transform = toScreenTransform(mouse.x, (mouse.z + mouseOld.z) / 2);
			e_txtz.textContent = toPadString(zDis);
		}
		e_linz.setAttribute("x1", toScreenX(mouse.x));
		e_linz.setAttribute("y1", toScreenZ(mouseOld.z));
		e_linz.setAttribute("x2", toScreenX(mouse.x));
		e_linz.setAttribute("y2", toScreenZ(mouse.z));
	}
};

export function home() {
	myPanzoom.pause();
	if (Math.abs(w / 2 - x) < 0.05 && Math.abs(h / 2 - z) / 2 < 0.05) {
		myPanzoom.smoothZoomAbs(
			w / 2,
			h / 2,
			ZOOMINITIAL
		);
	} else {
		myPanzoom.smoothMoveTo(
			w / 2,
			h / 2,
		);
	}
	setTimeout(myPanzoom.resume);
}

export function getMouselock() {
	return parseFloat(e_mouselock.value) || MOUSELOCKDEFAULT;
}

export async function init() {
	myPanzoom = panzoom(e_draw, {
		zoomDoubleClickSpeed: 1,
		smoothScroll: true,
		smoothPan: true,
		maxZoom: ZOOMMAX,
		minZoom: ZOOMMIN,
		owner: e_main, // transform e_main
		beforeMouseDown: event => {
			console.log(event.button);
			return event.button !== 1;
		},
		beforeWheel: event => {
			event.preventDefault(); // no window zooming allowed
			if (event.shiftKey) {
				const d = getMouselock() * Math.sign(event.deltaY);
				mouse.y += d;
				updateMouse();
				for (const desc of sel) {
					desc.thing.pos.translate(desc.pos, 0, d, 0);
				}
				return true;
			} else if (event.ctrlKey) {
				for (const desc of sel) {
					if (event.deltaY < 0)
						desc.thing.elMoveDown(desc.thing.el);
					else
						desc.thing.elMoveUp(desc.thing.el);
				}
				return true;
			}
			if (scale >= ZOOMMAX) {
				tooltip("Maximum zoom reached ☹️");
			} else if (scale <= ZOOMMIN) {
				tooltip("Minimum zoom reached ☹️");
			}
			return false;
		}
	});
	resize();
	myPanzoom.on("transform", event => { // on change in transform (pan, zoom or resize)
		const transform = event.getTransform();
		x = transform.x;
		z = transform.y;
		scale = transform.scale;
		render();
		updateMouse();
		return false;
	});
	myPanzoom.moveTo(can.width / 2, can.height / 2); // move to the center
	myPanzoom.zoomAbs(can.width / 2, can.height / 2, ZOOMINITIAL);
	e_draw.setAttribute("font-size", `${100 / ZOOMINITIAL}px`);
	e_main.addEventListener("contextmenu", event => {
		binds.fire("context");
		event.preventDefault();
	});
	e_main.addEventListener("pointerdown", event => {
		if (event.button !== 0) return; // must be lclick
		if (event.target !== can) return;
		e_selr.style.display = "none";
		mouseReal.x = event.layerX;
		mouseReal.y = event.layerY;
		mouseOld.x = (mouseReal.x - x) / scale;
		mouseOld.y = mouse.y;
		mouseOld.z = (mouseReal.y - z) / scale;
		const mouselock = getMouselock();
		mouseOld.x = Math.floor(mouseOld.x / mouselock) * mouselock;
		mouseOld.z = Math.floor(mouseOld.z / mouselock) * mouselock;
		const hovering = place.at(mouse.x, mouse.y, mouse.z);
		if (!event.shiftKey) // check if shift
			sel.clear();
		if (hovering) {
			sel.toggle(hovering);
			selectionPointerDown({ // a bit jank, but it works
				pointerId: event.pointerId,
				target: hovering.el,
				shiftKey: event.shiftKey,
				ctrlKey: event.ctrlKey
			});
			return;
		}
		click = true;
		selr = true; // start the select
	});
	e_main.addEventListener("pointerup", event => {
		e_selr.style.display = "none";
		if (click) {
			selr = false;
			click = false;
			binds.fire("click");
			return;
		}
		if (selr) {
			selr = false;
			if (!event.shiftKey)
				sel.clear();
			// Find items in selection
			const rect = {
				x1: Math.min(mouseOld.x, mouse.x),
				z1: Math.min(mouseOld.z, mouse.z),
				x2: Math.max(mouseOld.x, mouse.x),
				z2: Math.max(mouseOld.z, mouse.z)
			};
			for (const thing of place.things) {
				const pos = thing.pos.data;
				for (let i = 0; i < pos.length; i += 3) {
					if (pos[i] >= rect.x1 && pos[i] <= rect.x2 && pos[i + 2] >= rect.z1 && pos[i + 2] <= rect.z2) {
						sel.add({
							thing: thing,
							pos: i / 3
						});
					}
				}
			}
			updateMouse();
			return;
		}
		selr = false;
		if (event.target === can) {
			if ((context.isOpen || wheel.isOpen) && event.button !== 2)
				click = false;
			context.close();
			wheel.close();
			return;
		}
		
	});
	e_main.addEventListener("pointermove", event => {
		click = false;
		if (event.target !== can) return;
		mouseReal.x = event.layerX;
		mouseReal.y = event.layerY;
		updateMouse();
	});
}