
import * as camera from "./camera.js"; // for mouse position

export let isOpen = false;

const e_context = document.getElementById("context");

export function open(el) {
	e_context.appendChild(el);
	e_context.style.left = `${camera.mouse.x * camera.scale + camera.x}px`;
	e_context.style.top = `${camera.mouse.z * camera.scale + camera.z}px`;
	e_context.style.display = "block";
	isOpen = true;
}

export function close() {
	isOpen = false;
	e_context.style.display = "none";
	e_context.innerHTML = "";
}