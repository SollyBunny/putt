
import * as THREE from "../../lib/three.js";
import * as CANNON from "../../lib/cannon.js";

class Platonic extends Thing {}

const TetraSceneGeo = new THREE.TetrahedronGeometry(1, 0);
export class Tetra extends Platonic {
	get id() { return 7; }
	get desc() { return "A tetrahedron (3D triangle)"; }
	createSceneGeo() { return TetraSceneGeo.copy(); }
}

const CubeSceneGeo = new THREE.BoxGeometry(1, 1, 1).translate(-0.5, -0.5, -0.5);
const CubeWorldGeo = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
export class Cube extends Platonic {
	get id() { return 8; }
	get desc() { return "A cube (3D square)"; }
	createWorldGeo() { return CubeWorldGeo.copy(); }
	createSceneGeo() { return CubeSceneGeo.copy(); }
}

const OctaSceneGeo = new THREE.OctahedronGeometry(1, 0);
export class Octa extends Platonic {
	get id() { return 9; }
	get desc() { return "An octahedron (3D diamond)"; }
	createSceneGeo() { return OctaSceneGeo.copy(); }
}

const DodecaSceneGeo = new THREE.DodecahedronGeometry(1, 0);
export class Dodeca extends Platonic {
	get id() { return 10; }
	get desc() { return "A dodecahedron (3D hexagon)"; }
	createSceneGeo() { return DodecaSceneGeo.copy(); }
}

const IcosaSceneGeo = new THREE.IcosahedronGeometry(1, 0);
export class Icose extends Platonic {
	get id() { return 11; }
	get desc() { return "An icosahedron (dice with 20 sides)"; }
	createSceneGeo() { return IcosaSceneGeo.copy(); }
}

const SphereSceneGeo = new THREE.SphereGeometry(1, 32, 32);
const SphereWorldGeo = new CANNON.Sphere(1);
export class Sphere extends Platonic {
	get id() { return 12; }
	get desc() { return "A sphere or ball"; }
	createSceneGeo() { return SphereSceneGeo.copy(); }
	createWorldGeo() { return SphereWorldGeo.copy(); }
}