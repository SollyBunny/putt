
import { Cross, Tee, Why, Cone, Cylinder, Donut } from "./things/other.js";
import { Tetra, Cube, Octa, Dodeca, Icose, Sphere } from "./things/platonic.js";
import { Floor, BFloor, Wall, BWall, Platform, BPlatform } from "./things/surface.js";
import { Player, Start, Hole, Powerup } from "./things/game.js";

export { Cross, Tee, Why, Cone, Cylinder, Donut };
export { Tetra, Cube, Octa, Dodeca, Icose, Sphere };
export { Floor, BFloor, Wall, BWall, Platform, BPlatform };
export { Player, Start, Hole, Powerup };

import { mouse } from "./camera.js";
import { Reactive } from "./reactive.js";

export class Place {
	constructor(els) {
		this.things = new Set();
		this.els = els;
		this.colsky   = new Reactive(this.els.colsky, this.cssUpdate.bind(this));
		this.colwall  = new Reactive(this.els.colwall, this.cssUpdate.bind(this));
		this.colfloor = new Reactive(this.els.colfloor, this.cssUpdate.bind(this));
		this.colobj   = new Reactive(this.els.colobj, this.cssUpdate.bind(this));
		this.coldecor = new Reactive(this.els.coldecor, this.cssUpdate.bind(this));
		this.cssUpdate();
	}
	cssUpdate() {
		this.els.drawstyle.innerHTML = `
			:root {
				--sky: ${this.colsky.get()};
				--wall: ${this.colwall.get()};
				--floor: ${this.colfloor.get()};
				--obj: ${this.colobj.get()};
				--decor: ${this.coldecor.get()};
			}
		`;
	}
	add(thing) {
		this.things.add(thing);
		// add to svg element
		if (thing.el) this.els.draw.appendChild(thing.el);
	}
	del(thing) {
		this.things.delete(thing);
		// remove from svg element
		if (thing.el) this.els.draw.removeChild(thing.el);
	}
	focus(thing) {
		let avgx = 0;
		let avgy = 0;
		let avgz = 0;
		for (let i = 0; i < thing.pos.length; i += 3) {
			avgx += thing.pos.get(i);
			avgy += thing.pos.get(i + 1);
			avgz += thing.pos.get(i + 2);
		}
		avgx /= thing.pos.length / 3;
		avgy /= thing.pos.length / 3;
		avgz /= thing.pos.length / 3;
		camera.panzoom.smoothMoveTo(avgx, avgz)
		mouse.y = avgy;
	}
	edit(thing) {
		focus(thing);
	}
}

export const place = new Place({
	draw: document.getElementById("draw"),
	drawstyle: document.getElementById("drawstyle"),
	colsky: document.getElementById("colsky"),
	colfloor: document.getElementById("colfloor"),
	colwall: document.getElementById("colwall"),
	colobj: document.getElementById("colobj"),
	coldecor: document.getElementById("coldecor"),
});

window.place = place;