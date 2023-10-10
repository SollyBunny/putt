
import { onClick } from "./main.js";

function toScreenX(x) { // client x -> screen x
	return x * camera.scale + camera.x;
}
function toScreenZ(z) { // client z -> screen z
	return z * camera.scale + camera.z;
}
function toScreenTransform(x, z) { // format client x, z to a transform
	return `translate(${toScreenX(x)}px, ${toScreenZ(z)}px)`;
}
function toPadString(n) { // format a number as a padded fixed number
	return String(Math.round(n * 100) / 100).padStart(2, " ");
}

const e_main = document.getElementById("main"); // get a lot of elements
const e_draw = document.getElementById("draw");
const e_ptrs = document.getElementById("ptrs");
const e_zoom = document.getElementById("zoom");
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

const e_mouselock = document.getElementById("mouselock");

const can = document.getElementById("background");
const ctx = can.getContext("2d");

export const mouseReal = {x: 0, y: 0};
export const mouse = {x: 0, y: 0, z: 0};
export const mouseOld = {x: 0, y: 0, z: 0};
let click = false;

const camera = panzoom(e_draw, {
	zoomDoubleClickSpeed: 1,
	smoothScroll: true,
	smoothPan: true,
	owner: e_main // transform e_main
});

camera.x = 0;
camera.z = 0;
camera.scale = 1;
camera.w = can.width;
camera.h = can.height;

camera.render = () => {
	// Set grid line size
	let size = camera.scale;
	while (size < 30) size *= 10;
	while (size > 70) size /= 10;
	// Setup ctx
	ctx.clearRect(0, 0, camera.w, camera.h);
	ctx.lineWidth = 1;
	// Minor Grid Lines
	ctx.strokeStyle = "#555";
	ctx.beginPath();
	// `(camera.<axis> < 0 ? Math.floor : Math.ceil)` is because it must round away from 0
	for (let n = camera.x % size, i = (camera.x < 0 ? Math.floor : Math.ceil)(-camera.x / size); n < camera.w; n += size, ++i) {
		// Minor X Lines
		if (i % 5 === 0) continue; // skip Minor X Lines
		ctx.moveTo(n, 0);
		ctx.lineTo(n, camera.h);
	}
	for (let n = camera.z % size, i = (camera.z < 0 ? Math.floor : Math.ceil)(-camera.z / size); n < camera.h; n += size, ++i) {
		// Minor Y Lines
		if (i % 5 === 0) continue; // skip Minor Y Lines
		ctx.moveTo(0, n);
		ctx.lineTo(camera.w, n);
	}
	ctx.stroke();
	// Major Grid Lines
	size *= 5;
	ctx.strokeStyle = "#aaa";
	ctx.beginPath();
	for (let n = camera.x % size, i = (camera.x < 0 ? Math.floor : Math.ceil)(-camera.x / size); n < camera.w; n += size, ++i) {
		// Major X Lines
		ctx.moveTo(n, 0);
		ctx.lineTo(n, camera.h);
	}
	for (let n = camera.z % size, i = (camera.z < 0 ? Math.floor : Math.ceil)(-camera.z / size); n < camera.h; n += size, ++i) {
		// Major Y Lines
		ctx.moveTo(0, n);
		ctx.lineTo(camera.w, n);
	}
	ctx.stroke();
	// Middle Grid Lines
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(camera.x, 0); // X
	ctx.lineTo(camera.x, camera.h);
	ctx.moveTo(0, camera.z); // Y
	ctx.lineTo(camera.w, camera.z);
	ctx.stroke();
};
camera.resize = () => {
	const bounding = e_main.parentElement.getBoundingClientRect();
	can.width = camera.w = bounding.width;
	can.height = camera.h = bounding.height;
	camera.render();
};

camera._updateMouseLastUpdate = Date.now();
camera.updateMouse = () => {
	const now = Date.now();
	if (now - camera._updateMouseLastUpdate < 10) return; // only continue if it has been more than 10ms than the last update
	camera._updateMouseLastUpdate = now;
	mouse.x = (mouseReal.x - camera.x) / camera.scale;
	mouse.z = (mouseReal.y - camera.z) / camera.scale;
	const mouselock = parseFloat(e_mouselock.value) || 10;
	mouse.x = Math.floor(mouse.x / mouselock) * mouselock;
	mouse.z = Math.floor(mouse.z / mouselock) * mouselock;
	// Primary Pointer
	e_ptr1.style.transform = toScreenTransform(mouse.x, mouse.z);
	e_ptr1.children[1].textContent = `${toPadString(mouse.x)}, ${toPadString(mouse.y)}, ${toPadString(mouse.z)}`;
	// Old / Secondary Pointer
	const hyp = Math.sqrt((mouse.x - mouseOld.x) ** 2 + (mouse.z - mouseOld.z) ** 2);
	if (hyp < 100 / camera.scale) {
		e_ptr2.children[1].textContent = "";
	} else {
		e_ptr2.children[1].textContent = `${toPadString(mouseOld.x)}, ${toPadString(mouseOld.y)}, ${toPadString(mouseOld.z)}`;
	}
	e_ptr2.style.transform = toScreenTransform(mouseOld.x, mouseOld.z);
	// Circle
	e_circ.setAttribute("r", hyp);
	e_circ.style.transform = toScreenTransform(mouseOld.x, mouseOld.z);
	// Hyp
	if (hyp < 50 / camera.scale) {
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
	const x = Math.abs(mouse.x - mouseOld.x);
	if (x < 50 / camera.scale) {
		e_txtx.textContent = "";
	} else {
		e_txtx.style.transform = toScreenTransform((mouse.x + mouseOld.x) / 2, mouseOld.z);
		e_txtx.textContent = toPadString(x);
	}
	e_linx.setAttribute("x1", toScreenX(mouseOld.x));
	e_linx.setAttribute("y1", toScreenZ(mouseOld.z));
	e_linx.setAttribute("x2", toScreenX(mouse.x));
	e_linx.setAttribute("y2", toScreenZ(mouseOld.z));
	// Line Z
	const z = Math.abs(mouse.z - mouseOld.z);
	if (x < 50 / camera.scale) {
		e_txtz.textContent = "";
	} else {
		e_txtz.style.transform = toScreenTransform(mouseOld.x, (mouse.z + mouseOld.z) / 2);
		e_txtz.textContent = toPadString(z);
	}
	e_linz.setAttribute("x1", toScreenX(mouse.x));
	e_linz.setAttribute("y1", toScreenZ(mouseOld.z));
	e_linz.setAttribute("x2", toScreenX(mouse.x));
	e_linz.setAttribute("y2", toScreenZ(mouse.z));
};
camera.on("transform", event => { // on change in transform (pan, zoom or resize)
	const transform = event.getTransform();
	camera.x = transform.x;
	camera.z = transform.y;
	camera.scale = transform.scale;
	e_zoom.textContent = toPadString(transform.scale); // set transform text
	click = false; // the screen has moved, a click isn't possible
	camera.render();
	camera.updateMouse();
});
e_main.addEventListener("pointerdown", event => {
	if (event.target !== background) return; // cancel if not clicking background (eg if wheel is open)
	click = true; // a click is possible
	mouseReal.x = event.layerX;
	mouseReal.y = event.layerY;
	mouseOld.x = (mouseReal.x - camera.x) / camera.scale;
	mouseOld.z = (mouseReal.y - camera.z) / camera.scale;
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
	if (event.target !== background) return; // cancel if not moving across background (eg if wheel is open)
	mouseReal.x = event.layerX;
	mouseReal.y = event.layerY;
	camera.updateMouse();
});

window.camera = camera;

export function init() {
	camera.moveTo(camera.w / 2, camera.h / 2); // move to center of screen at start
}
