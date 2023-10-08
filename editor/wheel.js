
import * as things from "./things.js";

const e_wheel = document.getElementById("wheel");
const e_wheelcontent = document.getElementById("wheelcontent");

let wheelClickPromise = undefined;
let wheelOpen = false;
let wheelSelected = 2;

const data = [
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
		things.BFloor,
		things.Wall,
		things.BWall,
		things.Platform,
		things.BPlatform,
	], [
		things.Player,
		things.Start,
		things.Hole,
		things.Powerup,
	]
];

{ // Construct wheel
	let wheelID = 0;
	function wheelScroll(event) {
		scroll(parseInt(event.target.ID));
	}
	function wheelClick(event) {
		if (wheelClickPromise === undefined) return;
		wheelClickPromise(data[wheelSelected][parseInt(event.target.ID)]);
	}
	Object.values(document.getElementsByClassName("wheel")).forEach(wheel => {
		let children = Object.values(wheel.children);
		let title = children[0];
		if (wheelID > 0) {
			title.children[0].ID = wheelID - 1;
			title.children[0].addEventListener("click", wheelScroll);
		}
		if (wheelID < 3) {
			title.children[2].ID = wheelID + 1;
			title.children[2].addEventListener("click", wheelScroll);
		}
		children.shift();
		let i = 0;
		children.forEach(el => {
			el.ID = i;
			el.thing = new data[wheelID][i]();
			el.addEventListener("click", wheelClick);
			el.innerHTML = `${el.innerText} <br> ${i + 1}`;
			console.log(wheelID, i)
			el.title = el.thing.desc;
			i += 1;
		})
		wheelID += 1;
	});
}

export function open() {
	wheelOpen = true;
	e_wheel.style.left = event.layerX + "px";
	e_wheel.style.top = event.layerY + "px";
	e_wheel.style.display = "block";
	if (wheelClickPromise !== undefined) {
		wheelClickPromise(undefined);
		wheelClickPromise = undefined; // just to make sure
	}
	new Promise(resolve => { wheelClickPromise = resolve; }).then(thing => {
		wheelClickPromise = undefined;
		close();
		if (thing === undefined) return;
		console.log(thing);
		
	});
}

export function scroll(n) {
	wheelSelected = n;
	console.log(n, wheelClickPromise)
	e_wheelcontent.style.transform = `translateX(-${400 * n}px)`;
}

export function close() {
	wheelOpen = false;
	e_wheel.style.display = "none";
	if (wheelClickPromise !== undefined) {
		wheelClickPromise(undefined);
		wheelClickPromise = undefined; // just to make sure
	}
}

export function toggle() {
	if (wheelOpen === true) {
		close();
	} else {
		open();
	}
}

export function select(n) {
	
}

scroll(wheelSelected);