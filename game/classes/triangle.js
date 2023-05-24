class Triangle extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.6, -0.8),
			new THREE.Vector2( 0.8, -0.8),
			new THREE.Vector2( 0.8,  0.6),
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
	//shape = new CANNON.Sphere(1); // TODO get an actuall triangle
	shape = new CANNON.ConvexPolyhedron([
		// Bottom face
		new CANNON.Vec3(-1, -0.5, -1),
		new CANNON.Vec3( 1, -0.5, -1),
		new CANNON.Vec3( 1, -0.5,  1),
		// Top face
		new CANNON.Vec3(-1, 0.5, -1),
		new CANNON.Vec3( 1, 0.5, -1),
		new CANNON.Vec3( 1, 0.5,  1),
	], [
		// Bottom face
		[0, 1, 2],
		// Top face
		[3, 4, 5],
		// // Side A
		// [0, 1, 4],
		// [4, 3, 0],
		// // Side B
		// [2, 5, 3],
		// [3, 0, 2]
		// // Side C
		// [1, 2, 5],
		// [5, 4, 1]
		// Side A
		[4, 1, 0],
		[0, 3, 4],
		// Side B
		[2, 5, 3],
		[3, 0, 2],
		// Side C
		[5, 2, 1],
		[1, 4, 5]
		
	]);
	constructor(pos) {
		super(Types.Triangle);
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
