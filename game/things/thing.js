
import * as THREE from "../../lib/three.js";
import * as CANNON from "../../lib/cannon.js";
import { mergeVertices } from "../../lib/three.ext.js";
import materials from "../materials.js";

export function geoScene2World(geo) {
	// I really hope this is implemented (CANNON.JS says it's not, CANNON.ES says maybe?), otherwise I have to go and implement it ...
	// Convert the Scene Geo into a World Geo using voodoo witchcraft
	mergeVertices(geo, 0);
	geo.computeBoundingSphere()
	const shape = new CANNON.Trimesh([], []); // Can't use constructor as it will calculate things already known
	shape.indices = geo.index.array;
	shape.vertices = geo.attributes.position.array;
	shape.boundingSphereRadius = geo.boundingSphere.radius
	// Set normals to prevent duplicate calculation
	const normals = geo.attributes.normal.array;
	shape.faceNormals = [];
	for (let i = 0; i < normals.length; i += 3) {
		shape.faceNormals.push(new CANNON.Vec3(
			normals[i],
			normals[i + 1],
			normals[i + 2])
		);
	}
	// Finish construction
	shape.updateEdges();
	// shape.updateNormals()
	shape.updateAABB(); // TODO check if Scene Geo has AABB (bounding box) and copy it if it does
	// shape.updateBoundingSphereRadius()
	shape.updateTree();
	return new CANNON.Box(new CANNON.Vec3(1, 1, 1));
}

const DefaultSceneGeo = new THREE.SphereGeometry(0.5, 16);
export class Thing {
	createSceneMat() { return materials.scene.OBJ.clone(); }
	createWorldMat() { return materials.world.BOUNCY; }
	createSceneGeo() { return DefaultSceneGeo.clone(); }
	createWorldGeo() { return geoScene2World(this.sceneGeo); }
	createBody() {
		// These are temp values and shouldn't be used outside the construction of the body or mesh
		this.worldGeo = this.createWorldGeo();
		this.worldMat = this.createWorldMat();
		return new CANNON.Body({
			mass: 0,
			shape: this.worldGeo,
			material: this.sceneMat,
			position: new CANNON.Vec3(this.pos[0], this.pos[1], this.pos[2])
		});
	}
	createMesh() {
		// These are temp values and shouldn't be used outside the construction of the body or mesh
		this.sceneGeo = this.createSceneGeo();
		this.sceneMat = this.createSceneMat();
		const mesh = new THREE.Mesh(this.sceneGeo, this.sceneMat); // TODO use chain function to remove const assign
		mesh.position.set(this.pos[0], this.pos[1], this.pos[2]);
		return mesh;
	}
	constructor(pos, mods, props) {
		this.pos = pos;
		this.mods = mods;
		this.props = props;
		this.mesh = this.createMesh();
		this.body = this.createBody();
	}
}