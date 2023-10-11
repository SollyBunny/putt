
import { Cross, Tee, Why, Cone, Cylinder, Donut } from "./things/other.js";
import { Tetra, Cube, Octa, Dodeca, Icose, Sphere } from "./things/platonic.js";
import { Floor, BFloor, Wall, BWall, Platform, BPlatform } from "./things/surface.js";
import { Player, Start, Hole, Powerup } from "./things/game.js";

export { Cross, Tee, Why, Cone, Cylinder, Donut };
export { Tetra, Cube, Octa, Dodeca, Icose, Sphere };
export { Floor, BFloor, Wall, BWall, Platform, BPlatform };
export { Player, Start, Hole, Powerup };

import { mouse } from "./camera.js";

export class Place {
	constructor(draw) {
		this.things = new Set();
		this.draw = draw;
	}
	add(thing) {
		this.things.add(thing);
		// add to svg element
		if (thing.el) this.draw.appendChild(thing.el);
	}
	del(thing) {
		this.things.delete(thing);
		// remove from svg element
		if (thing.el) this.draw.removeChild(thing.el);
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

export const place = new Place(document.getElementById("draw"));
place.add(new Floor());
place.add(new Tetra());

window.place = place;