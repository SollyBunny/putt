class Jumppad extends Thing {
	geometry = new THREE.BoxGeometry(2, 0.1, 2);
	shape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 1));
	constructor(pos) {
		super(undefined, undefined, Types.Jumppad);
		this.mesh = new THREE.Mesh(this.geometry);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.1;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1], pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
		
	}
	onpush() {
		this.mesh.material = this.parent.materials.SG;
	}
	oncollide(e) {
		e.body.velocity.y = 5;
	}
}
