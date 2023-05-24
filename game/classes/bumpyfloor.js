class Bumpyfloor extends Thing {
	material = new THREE.MeshBasicMaterial({
		vertexColors: THREE.VertexColors
	});
	constructor(pos) {
		super(Types.FLOOR);
		const bounding = [
			pos[0][0],
			pos[0][2],
			pos[0][0],
			pos[0][2]
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
		const colors = [];
		const vertices = this.geometry.attributes.position.array;
		for (let i = 0; i < vertices.length; i += 3) {
			const x = vertices[i];
			const z = vertices[i + 1];
			if (x === 0 || z === 0 || x === bounding[1] || z === bounding[3]) continue;
			vertices[i + 2] = (x + z) % 2 * 0.2;
			colors.push(1, 0, 1);
		}
		this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
		this.geometry.computeVertexNormals();
		let faces = []; // Generate faces for physics
		for (let i = 0; i < this.geometry.index.count / 3; ++i) {
			faces.push([
				this.geometry.index.array[i * 3    ],
				this.geometry.index.array[i * 3 + 1],
				this.geometry.index.array[i * 3 + 2],
			]);
		}
		let points = []; // Format geometry points to CANNON.Vec3 for physics
		for (let i = 0; i < this.geometry.attributes.position.count; ++i) {
			points.push(new CANNON.Vec3(
				this.geometry.attributes.position.array[i * 3    ],
				this.geometry.attributes.position.array[i * 3 + 1],
				this.geometry.attributes.position.array[i * 3 + 2],
			));
		}
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.body = new CANNON.Body({
			mass: 0,
			shape: new CANNON.ConvexPolyhedron(
				points,
				faces
			),
			material: Physics.FLOOR
		});
		this.body.position.x = this.mesh.position.x = bounding[0] + width / 2;
		this.body.position.y = this.mesh.position.y = pos[0][1];
		this.body.position.z = this.mesh.position.z = bounding[1] + height / 2;
		this.mesh.rotation.x = -Math.PI / 2;
		this.body.quaternion.x = 2 ** 0.5 / 2;
		this.body.quaternion.w = -this.body.quaternion.x
	}
}

