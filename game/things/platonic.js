
import * as THREE from "../../lib/three.js";
import * as CANNON from "../../lib/cannon.js";

import { materials } from "../place.js";

class Platonic extends Thing {
	get material() { return materials.OBJ; }
}

export class Tetra extends Platonic {
	get id() { return 7; }
	get desc() { return "A tetrahedron (3D triangle)"; }
	constructor(pos, mods, props) {
		super(pos, mods, props);
	}
}

const CUBEGEOMETRY = new THREE.BoxGeometry(1, 1, 1).translate(-0.5, -0.5, -0.5);
const CUBESHAPE = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
export class Cube extends Platonic {
	get id() { return 8; }
	get desc() { return "A cube (3D square)"; }
	constructor(pos, mods, props) {
		super(pos, mods, props);
		this.geoemetry = CUBEGEOMETRY.copy();
		this.body = CUBESHAPE.copy();
		this.body = new CANNON.Body({
			mass: 
		})
	}
}

export class Octa extends Platonic {
	get id() { return 9; }
	get desc() { return "An octahedron (3D diamond)"; }
}

export class Dodeca extends Platonic {
	get id() { return 10; }
	get desc() { return "A dodecahedron (3D hexagon)"; }
}

export class Icose extends Platonic {
	get id() { return 11; }
	get desc() { return "An icosahedron (dice with 20 sides)"; }
}

const SPHEREGEOMETRY = new THREE.SphereGeometry(1, 32, 32);
export class Sphere extends Platonic {
	get id() { return 12; }
	get desc() { return "A sphere or ball"; }
	constructor(pos, mods, props) {
		super(pos, mods, props);
		const sphere = new Mesh(SPHEREGEOMETRY, this.material);
		sphere.position.set(pos[0], pos[1], pos[2]);
	}
}