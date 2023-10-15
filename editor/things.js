
import { Cross, Tee, Why, Cone, Cylinder, Donut } from "./things/other.js";
import { Tetra, Cube, Octa, Dodeca, Icose, Sphere } from "./things/platonic.js";
import { Floor, BFloor, Wall, BWall, Platform, BPlatform } from "./things/surface.js";
import { Player, Start, Hole, Powerup } from "./things/game.js";

export { Cross, Tee, Why, Cone, Cylinder, Donut };
export { Tetra, Cube, Octa, Dodeca, Icose, Sphere };
export { Floor, BFloor, Wall, BWall, Platform, BPlatform };
export { Player, Start, Hole, Powerup };

import { createElementInput, createElementInputPos, createElementInputMenu, createElementInputModifier, createElementSVG } from "./things/thing.js";
export { createElementInput, createElementInputPos, createElementInputMenu, createElementInputModifier, createElementSVG };

import { mouse } from "./camera.js";
import { Reactive } from "./reactive.js";
import { fromObj as modifierFromObj } from "./modifiers.js";
import { add as undoAdd } from "./undo.js";

export const IDS = {
	1: Cross,
	2: Tee,
	3: Why,
	4: Cone,
	5: Cylinder,
	6: Donut,
	7: Tetra,
	8: Cube,
	9: Octa,
	10: Dodeca,
	11: Icose,
	12: Sphere,
	13: Floor,
	14: BFloor,
	15: Wall,
	16: BWall,
	17: Platform,
	18: BPlatform,
	19: Player,
	20: Start,
	21: Hole,
	22: Powerup,
};

export class Place {
	constructor(els) {
		this.things = new Set();
		this.els = els;
		this.name     = new Reactive(this.els.placename);
		this.author   = new Reactive(this.els.authorname);
		this.colsky   = new Reactive(this.els.colsky, this.cssUpdate.bind(this));
		this.colwall  = new Reactive(this.els.colwall, this.cssUpdate.bind(this));
		this.colfloor = new Reactive(this.els.colfloor, this.cssUpdate.bind(this));
		this.colobj   = new Reactive(this.els.colobj, this.cssUpdate.bind(this));
		this.coldecor = new Reactive(this.els.coldecor, this.cssUpdate.bind(this));
		this.cssUpdate();
		this.chunks = {};
	}
	clear() {
		this.things.forEach(thing => {
			place.del(thing);
		});
		this.things.clear();
	}
	fromObj(data, undo) {
		if (undo === undefined || undo) {
			undoAdd(
				this.fromObj.bind(this, this.toObj(), false),
				this.fromObj.bind(this, data, false)
			); // Propably the most memory & compute intensive undo operation
		}
		this.clear();
		{
			const meta = data[0];
			this.name.set(meta[0]);
			this.author.set(meta[1]);
			this.colsky.set(meta[2]);
			this.colwall.set(meta[3]);
			this.colfloor.set(meta[4]);
			this.colobj.set(meta[5]);
			this.coldecor.set(meta[6]);
		}
		for (let thing of data.slice(1)) {
			const thingConstructor = IDS[thing[0]];
			if (!thingConstructor) {
				console.warn(`Unknown thing type: ${thing[0]}`);
				continue
			}
			const thingObj = new thingConstructor(thing[1]);
			if (thing[2]) // Set modifiers
				for (let modifier of thing[2])
					thingObj.modifiers.add(modifierFromObj(modifier));
			if (thing[3]) // Set properties
				for (let i = 0; i < thing[3].length; ++i)
					thingObj.properties.set(i, thing[3][i]);
			place.add(thingObj);
		}
		return place;
	}
	toObj() {
		const out = [
			[
				this.name.get(),
				this.author.get(),
				this.colsky.get(),
				this.colwall.get(),
				this.colfloor.get(),
				this.colobj.get(),
				this.coldecor.get(),
			]
		];
		this.things.forEach(thing => {
			const thingout = [
				thing.id,
				thing.pos.raw(),
			];
			if (thing.modifiers.length > 0) {
				const modifierout = [];
				thing.modifiers.forEach(modifier => {
					modifierout.push(modifier.toObj());
				});
				thingout[2] = modifierout;
			}
			if (thing.properties.length > 0) {
				if (!thingout[2]) thingout[2] = [];
				const propertyout = [];
				thing.properties.data.forEach(property => {
					propertyout.push(property);
				});
				thingout[3] = propertyout;
			}
			out.push(thingout);
		});
		return out;
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
		return thing;
	}
	del(thing) {
		this.things.delete(thing);
		// remove from svg element
		if (thing.el) this.els.draw.removeChild(thing.el);
		return thing;
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
		camera.panzoom.smoothMoveTo(avgx + camera.w / 2, avgz + camera.h / 2);
		mouse.y = avgy;
		return thing;
	}
	edit(thing) {
		focus(thing);
		return thing;
	}
	at(x, y, z) {
		for (let thing of this.things) {
			const pos = thing.pos.data;
			for (let i = 0; i < pos.length; i += 3) {
				if (pos[i] === x && pos[i + 1] === y && pos[i + 2] === z) {
					return {
						thing: thing,
						pos: i / 3
					};
				}
			}
		}
		return false;
		/*
		let mindis = Infinity;
		let minthing = undefined;
		let minpos = 0;
		for (let thing of this.things) {
			for (let i = 0; i < thing.pos.length; i += 3) {
				const dis = (
					(x - thing.pos.get(i)) ** 2 + 
					(y - thing.pos.get(i + 1)) ** 2 / 100 + 
					(z - thing.pos.get(i + 2)) ** 2
				);
				if (dis > 1) continue;
				if (dis > mindis) continue;
				mindis = dis;
				minthing = thing;
				minpos = i;
			}
		}
		if (minthing === undefined) return false;
		return {
			thing: minthing,
			pos: minpos / 3
		};
		*/
	}
}

export const place = new Place({
	draw: document.getElementById("draw"),
	drawstyle: document.getElementById("drawstyle"),
	placename: document.getElementById("placename"),
	authorname: document.getElementById("authorname"),
	colsky: document.getElementById("colsky"),
	colfloor: document.getElementById("colfloor"),
	colwall: document.getElementById("colwall"),
	colobj: document.getElementById("colobj"),
	coldecor: document.getElementById("coldecor"),
});

window.place = place;