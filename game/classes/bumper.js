class Bumper extends Thing {
	geometry = new THREE.TorusGeometry(0.8, 0.5, 20, 20).rotateX(Math.PI / 2);
	shape = new CANNON.Sphere(1.2);
	constructor(pos) {
		super(undefined, undefined, Types.Bumper);
		this.mesh = new THREE.Mesh(this.geometry);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
	}
	onpush() {
		this.mesh.material = this.parent.materials.SG;
	}
	collide(e) {
		let d = Math.atan2(
			e.body.position.x - e.target.position.x,
			e.body.position.z - e.target.position.z,
		);
		e.body.velocity.x = Math.sin(d) * 5;
		e.body.velocity.z = Math.cos(d) * 5;
	}
}
