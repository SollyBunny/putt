class Bumpyfloor extends Thing {
	constructor(pos) {
		super(Types.FLOOR);
		const bounding = [
			pos[0][0],
			pos[0][1],
			pos[0][0],
			pos[0][1]
		];
		for (let i = 1; i < pos.length; ++i) {
			if (pos[i][0] < bounding[0])
				bounding[0] = pos[i][0];
			else if (pos[i][0] > bounding[2])
				bounding[2] = pos[i][0];
			if (pos[i][2] < bounding[0])
				bounding[1] = pos[i][2];
			else if (pos[i][2] > bounding[2])
				bounding[3] = pos[i][2];
		}
		const width  = bounding[2] - bounding[0];
		const height = bounding[3] - bounding[1];
		this.geometry = new THREE.PlaneGeometry(width, height, width, height);
		this.mesh = new THREE.Mesh(this.geometry);
		this.mesh.position.x = bounding[0];
		this.mesh.position.y = bounding[1];
		this.mesh.position.z = pos[0][2];
		this.mesh.rotation.x = Math.PI / -2;
		this.geometry = mergeVertices(this.geometry, 0);
		for (let i = 0; i < this.geometry.attributes.position.count; ++i) {
			if ((
				this.geometry.attributes.position.array[i * 3] +
				this.geometry.attributes.position.array[i * 3 + 2]
			) % 2 == 0)
				this.geometry.attributes.position.array[i * 3 + 1] += 1;
		}
		return;
		let faces = [];
		faces = []; // Generate faces for physics
		for (let i = 0; i < this.geometry.index.count / 3; ++i) {
			faces.push([
				this.geometry.index.array[i * 3    ],
				this.geometry.index.array[i * 3 + 1],
				this.geometry.index.array[i * 3 + 2],
			]);
		}
		points = []; // Format geometry points to CANNON.Vec3 for physics
		for (let i = 0; i < this.geometry.attributes.position.count; ++i) {
			points.push(new CANNON.Vec3(
				this.geometry.attributes.position.array[i * 3    ],
				this.geometry.attributes.position.array[i * 3 + 1],
				this.geometry.attributes.position.array[i * 3 + 2],
			));
		}
		this.mesh = new THREE.Mesh(this.geometry);
		this.body = new CANNON.Body({
			mass: 0,
			shape: new CANNON.ConvexPolyhedron(
				points,
				faces
			),
			material: Physics.FLOOR
		});
	}
	onpush() {
		this.mesh.material = this.parent.materials.BG;
	}
}

