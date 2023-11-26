
import * as THREE from "../lib/three.js";
import * as CANNON from "../lib/cannon.js";

const materials = {};
materials.scene = {
	FLOOR:      new THREE.MeshPhongMaterial({ flatShading: true }), // Used for flat floor
	SLOPE:      new THREE.MeshPhongMaterial({ flatShading: true }), // Used for bumpy / special floor
	WALL:       new THREE.MeshLambertMaterial({ transparent: true }), // Used for wall
	OBJ:        new THREE.MeshLambertMaterial(), // Used for obstacles
	DECOR:      new THREE.MeshLambertMaterial(), // Used for decorations
	HOLE:       new THREE.MeshLambertMaterial({ side: THREE.BackSide }), // Used for hole
	START:      new THREE.MeshLambertMaterial({ side: THREE.BackSide, transparent: true, opacity: 0.8 }), // Used for start
};
materials.world = {
	BOUNCY:     new CANNON.Material({ friction: 0.0, restitution: 0.5 }),
	PLAYER:     new CANNON.Material({ friction: 1, restitution: 1 }),
};
export default materials;