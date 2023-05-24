class Floor extends Thing {
	constructor(pos, data) {
		super(Types.FLOOR)
		let points = [];
		for (let i = 0; i < pos.length; ++i) {
			points.push(new THREE.Vector3(pos[i][0], pos[i][1], pos[i][2]));
			points.push(new THREE.Vector3(pos[i][0], -100, pos[i][2]));
		}
		this.geometry = new ConvexGeometry(points);
		this.geometry.computeBoundingBox();
		let x, z; // x used as flag
		for (let i = 2; i < data.length; ++i) {
			if (
				data[i][0] !== Types.HOLE ||
				data[i][1][1] !== pos[0][1] + 60 ||
				this.geometry.boundingBox.min.x > data[i][1][0] ||
				this.geometry.boundingBox.max.x < data[i][1][0] ||
				this.geometry.boundingBox.min.z > data[i][1][2] ||
				this.geometry.boundingBox.max.z < data[i][1][2]
			) continue;
			x = data[i][1][0];
			z = data[i][1][2];
		}
		let faces = [];
		if (x !== undefined) { // there is a hole
			console.log("hole")
			for (let i = 0; i < 20; ++i) { // Generate 20 points on a circle
				points.push(new THREE.Vector3(
					x + Math.sin(Math.PI * 2 * (i / 20)) * 0.7,
					pos[0][1] + 120.5,
					z + Math.cos(Math.PI * 2 * (i / 20)) * 0.7
				));
			}
			this.geometry = mergeVertices(new ConvexGeometry(points)); // can't use 0 precision, faces get misplaced (probably floating point precision bug)
			points = [];
			// Find all the points from the circle in the new geometry
			for (let i = 0; i < this.geometry.attributes.position.count; ++i) {
				if (Math.round(this.geometry.attributes.position.array[i * 3 + 1] % 1 * 10) === 5) { // If this point's y pos has 0.5 added to it, then it is a point from the circle
					this.geometry.attributes.position.array[i * 3 + 1] -= 60.5; // Reset position of circle point
					points.push(i);
				}
			}
			// Filter out faces made of circle points (to create hole)
			let newpoints = []; // generate points for new mesh at same time
			for (let i = 0; i < this.geometry.index.count / 3; ++i) {
				if (
					points.indexOf(this.geometry.index.array[i * 3    ]) !== -1 &&
					points.indexOf(this.geometry.index.array[i * 3 + 1]) !== -1 &&
					points.indexOf(this.geometry.index.array[i * 3 + 2]) !== -1
				) continue; // these faces are inside the hole, so ignore them
				newpoints = newpoints.concat([
					this.geometry.index.array[i * 3    ],
					this.geometry.index.array[i * 3 + 1],
					this.geometry.index.array[i * 3 + 2],
				]);
				faces.push([
					this.geometry.index.array[i * 3    ],
					this.geometry.index.array[i * 3 + 1],
					this.geometry.index.array[i * 3 + 2],
				]);
			}
			this.geometry.index.array = new Uint16Array(newpoints); // set new points in mesh
			this.geometry.index.count = this.geometry.index.array.length; // set new length
		} else {
			this.geometry = mergeVertices(this.geometry, 0);
			faces = []; // Generate faces for physics
			for (let i = 0; i < this.geometry.index.count / 3; ++i) {
				faces.push([
					this.geometry.index.array[i * 3    ],
					this.geometry.index.array[i * 3 + 1],
					this.geometry.index.array[i * 3 + 2],
				]);
			}
		}
		points = []; // Format geometry points to CANNON.Vec3 for physics
		for (let i = 0; i < this.geometry.attributes.position.count; ++i) {
			points.push(new CANNON.Vec3(
				this.geometry.attributes.position.array[i * 3    ],
				this.geometry.attributes.position.array[i * 3 + 1],
				this.geometry.attributes.position.array[i * 3 + 2],
			));
		}
		if (x !== undefined) this.geometry.computeVertexNormals(); // TODO only calculate normals you must, this adds 0.5s to loading
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
		this.mesh.material = this.parent.materials.BG
	}
}
