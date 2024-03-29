
import * as things from "./things.js";
import * as camera from "./camera.js"; // for mouse position
import * as binds from "./binds.js";
import * as undo from "./undo.js";
import { Game } from "./things/game.js";

const e_wheel = document.getElementById("wheel");
const e_wheelcontent = document.getElementById("wheelcontent");

export let isOpen = false;
export let selected = 2;

let clickPromise = undefined; // the call back

export const data = [
	[
		things.Cross,
		things.Tee,
		things.Why,
		things.Cone,
		things.Cylinder,
		things.Donut,
	], [
		things.Tetra,
		things.Cube,
		things.Octa,
		things.Dodeca,
		things.Icose,
		things.Sphere,
	], [
		// Most important in center
		things.Floor,
		things.Wall,
		things.Platform,
		things.BWall,
		things.BFloor,
		things.BPlatform,
	], [
		things.Start,
		things.Hole,
		things.Powerup,
		things.Player,
	]
];

export async function init() {
	let wheelID = 0;
	function wheelScroll(event) { // event callback for scrolling to different wheel
		scroll(parseInt(event.target.ID));
	}
	function wheelScrollLoop(event) {
		scrollWrong(parseInt(event.target.ID));
	}
	function wheelClick(event) { // event callback for clicking a wheel slice
		if (clickPromise === undefined) return; // only if the wheel is open
		clickPromise(data[selected][parseInt(event.target.ID)]); // call the callback
	}
	Object.values(document.getElementsByClassName("wheel")).forEach(wheel => { // for each wheel
		let children = Object.values(wheel.children);
		let title = children[0];
		if (wheelID > 0) { // if not the first wheel
			title.children[0].ID = wheelID - 1;
			title.children[0].addEventListener("click", wheelScroll); // add a listener on the title's left arrow
		} else {
			title.children[0].ID = 3;
			title.children[0].addEventListener("click", wheelScrollLoop); // add a listener on the title's left arrow to loop
		}
		if (wheelID < 3) { // if not the last wheel
			title.children[2].ID = wheelID + 1;
			title.children[2].addEventListener("click", wheelScroll); // add a listener on the title's right arrow
		} else {
			title.children[2].ID = 0;
			title.children[2].addEventListener("click", wheelScrollLoop); // add a listener on the title's left arrow to loop
		
		}
		children.shift(); // remove the title element from the children
		let i = 0;
		children.forEach(el => { // for each child (slice of the wheel)
			el.ID = i; // set ID
			el.thing = new data[wheelID][i](); // create an instance of the object
			el.addEventListener("click", wheelClick); // add listener
			el.innerHTML = `${el.innerText} <br> ${i + 1}`; // add a number
			el.title = el.thing.desc; // set description
			i += 1;
		})
		wheelID += 1;
	});
}

export function open() {
	isOpen = true;
	e_wheel.style.left = `${camera.mouse.x * camera.scale + camera.x}px`;
	e_wheel.style.top = `${camera.mouse.z * camera.scale + camera.z}px`;
	e_wheel.style.display = "block"; // show wheel
	if (clickPromise !== undefined) { // make sure there is no pending callback
		clickPromise(undefined);
		clickPromise = undefined; // just to make sure
	}
	const pos = [camera.mouse.x, camera.mouse.y, camera.mouse.z];
	new Promise(resolve => { clickPromise = resolve; }).then(thing => { // create a promise to wait for a click
		clickPromise = undefined;
		close(); // close the wheel
		if (thing === undefined) return;
		const thingNew = new thing(pos);
		place.add(thingNew);
		undo.add(
			place.del.bind(place, thingNew),
			place.add.bind(place, thingNew)
		);
	});
}

export function scroll(n) {
	selected = n;
	e_wheelcontent.style.transition = "ease 0.2s transform";
	e_wheelcontent.style.transform = `translateX(-${400 * n}px)`; // scroll the content
}

export function scrollWrong(n) {
	selected = n;
	e_wheelcontent.style.transition = "ease 0.6s transform";
	e_wheelcontent.style.transform = `translateX(-${400 * n}px)`;
}

export function close() {
	isOpen = false;
	e_wheel.style.display = "none";
	if (clickPromise !== undefined) { // make sure there is no pending callback
		clickPromise(undefined);
		clickPromise = undefined; // just to make sure
	}
}

export function toggle() {
	if (isOpen === true) {
		close();
	} else {
		open();
	}
}

export function select(n) {
	if (clickPromise === undefined) // check if open
	clickPromise(data[selected][n]);
}

scroll(selected); // scroll initially to surfaces
