
import { onClick } from "./main.js";

const e_main = document.getElementById("main");
const e_draw = document.getElementById("draw");
const e_ptrs = document.getElementById("ptrs");
const e_zoom = document.getElementById("zoom");
const e_ptr1 = document.getElementById("ptr1");
const e_ptr2 = document.getElementById("ptr2");
const e_circ = document.getElementById("circ");
const e_lins = document.getElementById("lins");
const e_linx = document.getElementById("linx");
const e_liny = document.getElementById("liny");
const e_linh = document.getElementById("linh");
const e_txtx = document.getElementById("txtx");
const e_txty = document.getElementById("txty");
const e_txth = document.getElementById("txth");

const e_mouselock = document.getElementById("mouselock");

const can = document.getElementById("background");
const ctx = can.getContext("2d");

export const mouseReal = {x: 0, y: 0};
export const mouse = {x: 0, y: 0, z: 0};
let click = false;

const camera = panzoom(e_draw, {
	zoomDoubleClickSpeed: 1,
	smoothScroll: true,
	smoothPan: true,
	owner: e_main
});

camera.x = 0;
camera.z = 0;
camera.scale = 1;

camera.render = () => {
	// let camerascale = camera.scale;
	let size = camera.scale;
	while (size < 30) size *= 10;
	while (size > 70) size /= 10;
	// while (camerascale < 20) camerascale *= 2, size /= 2;
	console.log(size)
	ctx.clearRect(0, 0, can.width, can.height);
	ctx.lineWidth = 1;
	// Minor Grid Lines
	ctx.strokeStyle = "#555";
	ctx.beginPath();
	for (let n = camera.x % size, i = (camera.x < 0 ? Math.floor : Math.ceil)(-camera.x / size); n < can.width; n += size, ++i) {
		if (i % 5 === 0) continue;
		ctx.moveTo(n, 0);
		ctx.lineTo(n, can.height);
	}
	for (let n = camera.z % size, i = (camera.z < 0 ? Math.floor : Math.ceil)(-camera.z / size); n < can.height; n += size, ++i) {
		if (i % 5 === 0) continue;
		ctx.moveTo(0, n);
		ctx.lineTo(can.width, n);
	}
	ctx.stroke();
	// Major Grid Lines
	size *= 5;
	ctx.strokeStyle = "#aaa";
	ctx.beginPath();
	for (let n = camera.x % size, i = (camera.x < 0 ? Math.floor : Math.ceil)(-camera.x / size); n < can.width; n += size, ++i) {
		ctx.moveTo(n, 0);
		ctx.lineTo(n, can.height);
	}
	for (let n = camera.z % size, i = (camera.z < 0 ? Math.floor : Math.ceil)(-camera.z / size); n < can.height; n += size, ++i) {
		ctx.moveTo(0, n);
		ctx.lineTo(can.width, n);
	}
	ctx.stroke();
	// Middle Grid Line
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(camera.x, 0);
	ctx.lineTo(camera.x, can.height);
	ctx.moveTo(0, camera.z);
	ctx.lineTo(can.width, camera.z);
	ctx.stroke();
};
camera.resize = () => {
	const bounding = e_main.parentElement.getBoundingClientRect();
	can.width = bounding.width;
	can.height = bounding.height;
	camera.render();
};
camera._updateMouseLastUpdate = Date.now();
camera.updateMouse = () => {
	const now = Date.now();
	if (now - camera._updateMouseLastUpdate < 10) return;
	camera._updateMouseLastUpdate = now;
	const transform = camera.getTransform();
	mouse.x = (mouseReal.x - transform.x) / transform.scale;
	mouse.z = (mouseReal.y - transform.y) / transform.scale;
	const mouselock = parseFloat(e_mouselock.value) || 10;
	mouse.x = Math.floor(mouse.x / mouselock) * mouselock;
	mouse.z = Math.floor(mouse.z / mouselock) * mouselock;
	e_ptr1.style.transform = `translate(${mouse.x * transform.scale + transform.x}px, ${mouse.z * transform.scale + transform.y}px)`;
	e_ptr1.children[1].textContent = `${String(mouse.x).padStart(3, " ")}, ${String(mouse.z).padStart(3, " ")}`;
};
camera.on("transform", function(e) {
	const transform = e.getTransform();
	camera.x = transform.x;
	camera.z = transform.y;
	camera.scale = transform.scale;
	e_zoom.textContent = transform.scale.toFixed(2);
	click = false;
	camera.render();
	camera.updateMouse();
});

e_main.addEventListener("pointerdown", event => {
	if (event.target !== background) return;
	click = true;
});
e_main.addEventListener("pointerup", event => {
	if (click === true) {
		click = false;
		onClick(event);
	}
});
e_main.addEventListener("pointermove", event => {
	click = false;
	mouseReal.x = event.layerX;
	mouseReal.y = event.layerY;
	camera.updateMouse();
});

window.camera = camera;

export function init() {
	camera.moveTo(can.width / 2, can.height / 2);
}
