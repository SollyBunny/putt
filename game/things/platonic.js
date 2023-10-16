import { Thing } from "./thing.js";
import { materials } from "../place.js";
import { BoxGeometry, Mesh } from "../../lib/three.js";

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

const CUBEGEOMETRY = new BoxGeometry(1, 1, 1).translate(-0.5, -0.5, -0.5);
export class Cube extends Platonic {
	get id() { return 8; }
	get desc() { return "A cube (3D square)"; }
	constructor(pos, mods, props) {
		super(pos, mods, props);
		const cube = new Mesh(CUBEGEOMETRY, this.material);
		cube.position.set(pos[0], pos[1], pos[2]);
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

export class Sphere extends Platonic {
	get id() { return 12; }
	get desc() { return "A sphere or ball"; }
}