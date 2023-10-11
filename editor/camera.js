
import { onClick } from "./main.js";

const e_main = document.getElementById("main"); // get a lot of elements
const e_draw = document.getElementById("draw");
const e_ptrs = document.getElementById("ptrs");
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

export const mouseReal = {x: 0, y: 0};
export const mouse = {x: 0, y: 0, z: 0};
export const mouseOld = {x: 0, y: 0, z: 0};
export let x = 0;
export let y = 0;
export let z = 0;

export let scale = 1;
export let w = can.width;
export let h = can.height;
let myPanzoom = undefined;
export { myPanzoom as panzoom };

export function toScreenX(a) { // client x -> screen x
	return a * scale + x;
}
export function toScreenZ(a) { // client z -> screen z
	return a * scale + z;
}
export function toScreenTransform(xIn, zIn) { // format client x, z to a transform
	return `translate(${toScreenX(xIn)}px, ${toScreenZ(zIn)}px)`;
}
export function toPadString(n) { // format a number as a padded fixed number
	return String(Math.round(n * 100) / 100).padStart(2, " ");
}

let click = false;

export function render() {
	// Set grid line size
	let size = scale;
	while (size < 30) size *= 10;
	while (size > 70) size /= 10;
	// Set zoom UI
	let sizezoom = 1;
	while (sizezoom * scale > 600) sizezoom /= 2;
	while (sizezoom * scale < 300) sizezoom *= 2;
	e_scalezoom.textContent = toPadString(scale) + "x";
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
export function updateMouse() {
	const now = Date.now();
	if (now - updateMouseLast < 10) return; // only continue if it has been more than 10ms than the last update
	updateMouseLast = now;
	mouse.x = (mouseReal.x - x) / scale;
	mouse.z = (mouseReal.y - z) / scale;
	const mouselock = parseFloat(e_mouselock.value) || 10;
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
	// Circle
	e_circ.setAttribute("r", hyp);
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
		e_txtz.style.transform = toScreenTransform(mouseOld.x, (mouse.z + mouseOld.z) / 2);
		e_txtz.textContent = toPadString(zDis);
	}
	e_linz.setAttribute("x1", toScreenX(mouse.x));
	e_linz.setAttribute("y1", toScreenZ(mouseOld.z));
	e_linz.setAttribute("x2", toScreenX(mouse.x));
	e_linz.setAttribute("y2", toScreenZ(mouse.z));
};

export async function init() {
	myPanzoom = panzoom(e_draw, {
		zoomDoubleClickSpeed: 1,
		smoothScroll: true,
		smoothPan: true,
		owner: e_main // transform e_main
	});
	resize();
	myPanzoom.on("transform", event => { // on change in transform (pan, zoom or resize)
		const transform = event.getTransform();
		x = transform.x;
		z = transform.y;
		scale = transform.scale;
		click = false; // the screen has moved, a click isn't possible
		render();
		updateMouse();
	});
	myPanzoom.moveTo(can.width / 2, can.height / 2); // move to the center
	e_main.addEventListener("pointerdown", event => {
		if (event.target !== can) return; // cancel if not clicking background (eg if wheel is open)
		click = true; // a click is possible
		mouseReal.x = event.layerX;
		mouseReal.y = event.layerY;
		mouseOld.x = (mouseReal.x - x) / scale;
		mouseOld.z = (mouseReal.y - z) / scale;
		const mouselock = parseFloat(e_mouselock.value) || 10;
		mouseOld.x = Math.floor(mouseOld.x / mouselock) * mouselock;
		mouseOld.z = Math.floor(mouseOld.z / mouselock) * mouselock;
	});
	e_main.addEventListener("pointerup", event => {
		if (click === false) return; // check if a mouse up and mouse down occured without any movement imbetween (aka click)
		click = false;
		onClick(event); // a click has occured
	});
	e_main.addEventListener("pointermove", event => {
		click = false; // drag has occured, so a click isn't possible
		if (event.target !== can) return; // cancel if not moving across background (eg if wheel is open)
		mouseReal.x = event.layerX;
		mouseReal.y = event.layerY;
		updateMouse();
	});
}