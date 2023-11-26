
import * as THREE from "../../lib/three.js";
import * as CANNON from "../../lib/cannon.js";

import { Thing, geoScene2World } from "./thing.js";

class Platonic extends Thing {}

const TetraSceneGeo = new THREE.TetrahedronGeometry(1, 0);
const TetraWorldGeo = geoScene2World(TetraSceneGeo);
export class Tetra extends Platonic {
	get id() { return 7; }
	get desc() { return "A tetrahedron (3D triangle)"; }
	createSceneGeo() { return TetraSceneGeo; }
	createWorldGeo() { return TetraWorldGeo; }
}

const CubeSceneGeo = new THREE.BoxGeometry(1, 1, 1).translate(-0.5, -0.5, -0.5);
const CubeWorldGeo = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
export class Cube extends Platonic {
	get id() { return 8; }
	get desc() { return "A cube (3D square)"; }
	createWorldGeo() { return CubeWorldGeo; }
	createSceneGeo() { return CubeSceneGeo; }
}

const OctaSceneGeo = new THREE.OctahedronGeometry(0.5, 0);
const OctaWorldGeo = geoScene2World(OctaSceneGeo);
export class Octa extends Platonic {
	get id() { return 9; }
	get desc() { return "An octahedron (3D diamond)"; }
	createSceneGeo() { return OctaSceneGeo; }
	createWorldGeo() { return OctaWorldGeo; }
}

const DodecaSceneGeo = new THREE.DodecahedronGeometry(0.5, 0);
const DodecaWorldGeo = geoScene2World(DodecaSceneGeo);
export class Dodeca extends Platonic {
	get id() { return 10; }
	get desc() { return "A dodecahedron (3D hexagon)"; }
	createSceneGeo() { return DodecaSceneGeo; }
	createWorldGeo() { return DodecaWorldGeo; }
}

const IcosaSceneGeo = new THREE.IcosahedronGeometry(0.5, 0);
const IcosaWorldGeo = geoScene2World(IcosaSceneGeo);
export class Icose extends Platonic {
	get id() { return 11; }
	get desc() { return "An icosahedron (dice with 20 sides)"; }
	createSceneGeo() { return IcosaSceneGeo; }
	createWorldGeo() { return IcosaWorldGeo; }
}

export class Sphere extends Platonic {
	get id() { return 12; }
	get desc() { return "A sphere or ball"; }
}