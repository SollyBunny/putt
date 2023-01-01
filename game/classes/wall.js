class Wall extends Thing {
	constructor(pos) {
		super(undefined, undefined, Types.WALL);
		this.mesh = new THREE.Object3D();
		this.body = [];
		let mesh, geometry, points, faces;
		for (let i = 1; i < pos.length; ++i) {
			geometry = new THREE.BoxGeometry(
				0.5, 60,
				Math.sqrt(
					(pos[i][0] - pos[i - 1][0]) ** 2 +
					(pos[i][2] - pos[i - 1][2]) ** 2
				) + 0.25,
			);
			for (let m = 0; m < geometry.attributes.position.count; ++m) {
				if (geometry.attributes.position.array[m * 3 + 1] === -30) continue;
				if (geometry.attributes.position.array[m * 3 + 2] > 0)
					geometry.attributes.position.array[m * 3 + 1] += pos[i][1];
				else
					geometry.attributes.position.array[m * 3 + 1] += pos[i - 1][1];					
			}
			mesh = new THREE.Mesh(
				geometry
			);
			mesh.position.x = pos[i][0];
			mesh.position.z = pos[i][2]
			mesh.rotation.y = Math.atan2(
				pos[i][0] - pos[i - 1][0],
				pos[i][2] - pos[i - 1][2],
			);
			mesh.position.x -= geometry.parameters.depth * Math.sin(mesh.rotation.y) / 2
			mesh.position.z -= geometry.parameters.depth * Math.cos(mesh.rotation.y) / 2
			mesh.position.y -= 29;
			this.mesh.add(mesh);
			let faces = [];
			for (let m = 0; m < geometry.index.count / 3; ++m) {
				faces.push([
					geometry.index.array[m * 3    ],
					geometry.index.array[m * 3 + 1],
					geometry.index.array[m * 3 + 2],					
				])
			}
			let points = [];
			for (let m = 0; m < geometry.attributes.position.count; ++m) {
				points.push(new CANNON.Vec3(
					geometry.attributes.position.array[m * 3    ],
					geometry.attributes.position.array[m * 3 + 1],
					geometry.attributes.position.array[m * 3 + 2],
				));
			}
			this.body.push(new CANNON.Body({
				mass: 0,
				shape: new CANNON.ConvexPolyhedron(
					points,
					faces
				),
				material: Physics.WALL,
				position: new CANNON.Vec3(
					mesh.position.x,
					mesh.position.y,
					mesh.position.z
				),
				quaternion: new CANNON.Quaternion(
					mesh.quaternion.x,
					mesh.quaternion.y,
					mesh.quaternion.z,
					mesh.quaternion.w
				)
			}));
		}
	}
	onpush() {
		this.mesh.children.forEach(i => {
			i.material = this.parent.materials.FG
		})
	}
}
