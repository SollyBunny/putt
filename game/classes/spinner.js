class Spinner extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.2, -1.2),
			new THREE.Vector2( 0.2, -1.2),
			new THREE.Vector2( 0.2,  1.2),
			new THREE.Vector2(-0.2,  1.2),
		]),
		{
			steps: 1,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.2,
			bevelSegments: 5,
		}
	).rotateX(Math.PI / 2);
	shape = new CANNON.Box(new CANNON.Vec3(0.4, 0.5, 1.4));
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
		this.mesh.material = this.parent.materials.FG;
	}
	onupdate() {
		this.mesh.rotation.y = tick / 1000;
		this.body.quaternion.x = this.mesh.quaternion.x;
		this.body.quaternion.y = this.mesh.quaternion.y;
		this.body.quaternion.z = this.mesh.quaternion.z;
		this.body.quaternion.w = this.mesh.quaternion.w;
	}
}
