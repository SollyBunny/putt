class Hole extends Thing {
	color = [
		new THREE.Color(1, 0, 0),
		new THREE.Color(1, 0.5, 0),
		new THREE.Color(1, 1, 0),
		new THREE.Color(0.5, 1, 0),
		new THREE.Color(0, 1, 0),
		new THREE.Color(0, 1, 0.5),
		new THREE.Color(0, 1, 1),
		new THREE.Color(0, 0.5, 1),
		new THREE.Color(0, 0, 1),
		new THREE.Color(0.5, 0, 1),
		new THREE.Color(1, 0, 1),
		new THREE.Color(1, 0, 0.5),
	]
	shape = new CANNON.ConvexPolyhedron(
		[
	        new CANNON.Vec3(-0.7, -1.6, -0.7),
	        new CANNON.Vec3( 0.7, -1.6, -0.7),
	        new CANNON.Vec3( 0.7, -0.2, -0.7),
	        new CANNON.Vec3(-0.7, -0.2, -0.7),
	        new CANNON.Vec3(-0.7, -1.6,  0.7),
	        new CANNON.Vec3( 0.7, -1.6,  0.7),
	        new CANNON.Vec3( 0.7, -0.2,  0.7),
	        new CANNON.Vec3(-0.7, -0.2,  0.7),
	    ],
	    [
		    [0,1,2,3], // -z b
            [3,2,1,0], // -z f
            [7,6,5,4], // +z b
            [4,5,6,7], // +z f
            [0,4,7,3], // -x b
            [3,7,4,0], // -x f
            [1,2,6,5], // +x b
            [5,6,2,1], // +x f
            [1,0,4,5], // +y b
            [5,4,0,1], // +y f
       ]
    );
    light = new THREE.PointLight(0xFFFFFF, 0.2);
    geometrybottom = new THREE.ShapeGeometry(new THREE.Shape([
    	new THREE.Vector2( 1,  1),
    	new THREE.Vector2(-1,  1),
    	new THREE.Vector2(-1, -1),
    	new THREE.Vector2( 1, -1),
    ])).rotateX(Math.PI / 2);
    geometrycylinder = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 20, 1, true);
	constructor(pos) {
		super(Types.HOLE);
		this.pos = pos;
		this.mesh = new THREE.Object3D();
		let mesh;
		{ // cylinder bottom
			mesh = new THREE.Mesh(this.geometrybottom); 
			mesh.position.x = pos[0];
			mesh.position.y = pos[1] - 1.6;
			mesh.position.z = pos[2];
			this.mesh.add(mesh);
		}
		{ // open cylinder
			mesh = new THREE.Mesh(this.geometrycylinder);
			mesh.position.x = pos[0];
			mesh.position.y = pos[1] - 0.8;
			mesh.position.z = pos[2];
			this.mesh.add(mesh);
		}
		if (Settings.LIGHTING) {
			const light = this.light.clone();
			light.position.set(pos[0], pos[1] + 5, pos[1]);
			this.mesh.add(light);
		}
    	this.body = new CANNON.Body({
			mass: 0,
			shape: this.shape,
			position: new CANNON.Vec3(pos[0], pos[1], pos[2]),
		});
	}
	onpush() {
		this.material = this.parent.materials.HOLE.clone();
		this.material.color = this.color[this.id];
		this.mesh.children[0].material = this.material;
		this.mesh.children[1].material = this.material;
		if (Settings.LIGHTING)
			this.mesh.children[2].color    = this.color[this.id];
	}
	oncollide(e) {
		e.body.parent.mesh.position.x = e.target.position.x;
		e.body.parent.mesh.position.y = e.target.position.y;
		e.body.parent.mesh.position.z = e.target.position.z;
		e.body.parent.hole();
	}
}
