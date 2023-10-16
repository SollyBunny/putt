
import * as THREE from "../lib/three.js";
import * as CANNON from "../lib/cannon.js";

import { scene, world } from "./engine.js";

import { Cross, Tee, Why, Cone, Cylinder, Donut } from "./things/other.js";
import { Tetra, Cube, Octa, Dodeca, Icose, Sphere } from "./things/platonic.js";
import { Floor, BFloor, Wall, BWall, Platform, BPlatform } from "./things/surface.js";
import { Player, Start, Hole, Powerup } from "./things/game.js";

export { Cross, Tee, Why, Cone, Cylinder, Donut };
export { Tetra, Cube, Octa, Dodeca, Icose, Sphere };
export { Floor, BFloor, Wall, BWall, Platform, BPlatform };
export { Player, Start, Hole, Powerup };

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

export const things = new Set();

export const materials = {
	FLOOR:      new THREE.MeshPhongMaterial({ flatShading: true }), // Used for flat floor
	FLOORSLOPE: new THREE.MeshPhongMaterial({ flatShading: true }), // Used for bumpy / special floor
	WALL:       new THREE.MeshLambertMaterial({ transparent: true }), // Used for wall
	OBJ:        new THREE.MeshLambertMaterial(), // Used for obstacles
	DECOR:      new THREE.MeshLambertMaterial(), // Used for decorations
	HOLE:       new THREE.MeshLambertMaterial({ side: THREE.BackSide }), // Used for hole
	START:      new THREE.MeshLambertMaterial({ side: THREE.BackSide, transparent: true, opacity: 0.8 }), // Used for start
};

export let name = "";
export let author = "";

export function reset() {
	for (const thing of things)
		del(thing);
	things.clear(); // Just in case
}

export function del(thing) {
	things.delete(thing);
	if (thing.mesh)
		scene.remove(thing.mesh);
	if (thing.body)
		world.removeBody(thing.body);
}

export function add(thing) {
	things.add(thing);
	if (thing.mesh)
		scene.add(thing.mesh);
	if (thing.body)
		world.addBody(thing.body);
}

export function fromObj(data) {
	{ // Meta
		const meta = data[0];
		name = meta[0];
		author = meta[1];
		// Sky
		scene.background.set(meta[2]);
		scene.fogbottom.material.color.set(meta[2]);
		// scene.fogbottom.material.needsUpdate = true;
		// Materials
		materials.FLOOR.color.set(meta[3]);
		materials.FLOORSLOPE.color.set(materials.FLOOR.color);
		materials.FLOORSLOPE.color.multiplyScalar(0.5);
		materials.WALL.color.set(meta[4]);
		materials.OBJ.color.set(meta[5]);
		materials.DECOR.color.set(meta[6]);
	}
	for (const thingData of data.slice(1) ) {
		const thingConstructor = IDS[thingData[0]];
		if (!thingConstructor) {
			console.warn(`Unknown thing type: ${thingData[0]}`);
			continue;
		}
		const thingObj = new thingConstructor(thingData[1], thingData[2], thingData[3]);
		add(thingObj);
	}
}
