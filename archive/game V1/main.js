// NOTE: xyz when possible

//const w = [[0,[-1,-1,0],[-1,4,0],[4,4,0],[4,-1,0]],[1,[4,-1,0],[-1,-1,0],[-1,4,0],[4,4,0]],[2,[0,0,0]],[0,[4,-1,0],[9,-1,-1],[9,4,-1],[4,4,0]],[0,[9,-1,-1],[14,-1,-1],[14,4,-1],[9,4,-1]],[1,[9,-1,-1],[14,-1,-1],[14,4,-1],[9,4,-1]],[3,[13,3,-1]]]
const w = [[0,[-8,8,2],[-8,23,2],[12,23,2],[12,8,2]],[3,[-3,20,2]],[0,[8,30,2],[17,11,2],[29,28,2],[20,41,2]],[3,[18,20,2]],[0,[5,4,2],[13,1,2],[23,9,2],[5,8,2]],[3,[14,3,2]],[4,[-6,10,2]],[4,[19,37,2]],[4,[27,28,2]],[1,[-10,19,2],[20,46,2],[41,10,2],[16,1,2],[10,-7,2],[-10,-21,2],[-33,-44,0],[-38,-31,0],[-21,-9,0],[-7,0,0],[-12,18,0],[-10,19,0]],[0,[-3,9,0],[-7,0,0],[-4,-15,0],[9,0,0],[5,10,0]],[0,[-35,-31,0],[-6,-2,0],[-2,-13,0],[-31,-39,0]],[3,[-32,-33,0]],[4,[-29,-37,0]],[4,[-25,-32,0]],[4,[-22,-30,0]],[4,[-18,-26,0]],[6,[-14,-22,0]],[6,[-12,-20,0]],[6,[-6,-16,0]],[7,[-2,-12,0]],[7,[1,-8,0]],[2,[0,0,0]]];
const keys = {};

let debug = true;

// cannon.js
	const world = new CANNON.World();
	world.gravity.set(0, -1, 0) // m/s²
	world.solver.iterations = 20;
	const phimaterialgolf = new CANNON.Material({
		restitution: 1,
		friction: 1
	});
	const phimaterialwall = new CANNON.Material({
		restitution: 1,
		friction: 0
	});
	const phimaterialfloor = new CANNON.Material({
		restitution: 0.5,
		friction: 1
	});
// three.js
	const can                = document.getElementById("can");
	const render             = new THREE.WebGLRenderer({
		canvas: can,
		logarithmicDepthBuffer: true
	});
	const scene              = new THREE.Scene();
	scene.background         = new THREE.Color(0x00AAFF);
	// scene.fog                = new THREE.Fog(0xFFFFFF, 30, 50);
	const camera             = new THREE.PerspectiveCamera(75, can.width / can.height, 0.1, 50);
	camera.rotation.order    = "YXZ";
	let camerafollow;
	{
		const light = new THREE.HemisphereLight(0xFFFFFF, 0, 1, 1);
		scene.add(light);
	} {
		const material = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0.1,
		});
		const geometry = new THREE.PlaneGeometry(1024, 1024);
		for (let i = 1; i < 10; ++i) {
			const fog = new THREE.Mesh(geometry, material);
			fog.position.y = -10 - i;
			fog.rotation.x = Math.PI / -2;
			scene.add(fog)
		}
	}
	const materialfloor               = new THREE.MeshLambertMaterial({
		color: new THREE.Color(0xFFAA55),
	});
	const materialwall                = new THREE.MeshLambertMaterial({
		color: new THREE.Color(0xDD9955),
	});
	const materialnonbouncy           = new THREE.MeshLambertMaterial({
		color: new THREE.Color(0xDD9955),
	});
	const materialhole                = new THREE.MeshLambertMaterial({
		color: new THREE.Color(0xDD9955),
		side: THREE.BackSide
	});
	{
		const texture = new THREE.TextureLoader().load("normal.jpg");
		if (!debug) materialfloor.normalMap = texture;
		            materialwall .normalMap = texture;
	}
	const materialgolf                = new THREE.MeshStandardMaterial({
		flatShading: true,
		color: new THREE.Color(0xFFFFFF),
		roughness: 0,
		depthTest: false
	});
	const materialarrow               = new THREE.MeshStandardMaterial({
		color: new THREE.Color(0xEE8800),
		depthTest: false
	});
	const arrowshape = new THREE.Shape([
		new THREE.Vector2(-0.2, 0),
		new THREE.Vector2(0.2, 0),
		new THREE.Vector2(0.2, 5),
		new THREE.Vector2(0.5, 5),
		new THREE.Vector2(0, 5.5),
		new THREE.Vector2(-0.5, 5),
		new THREE.Vector2(-0.2, 5),
		new THREE.Vector2(-0.2, 0),
	]);
	/*arrowshape.moveTo(-0.2, 0);
	arrowshape.lineTo(0.2, 0);
	arrowshape.lineTo(0.2, 5);
	arrowshape.lineTo(0.5, 5);
	arrowshape.lineTo(0, 5.5);
	arrowshape.lineTo(-0.5, 5);
	arrowshape.lineTo(-0.2, 5);
	arrowshape.lineTo(-0.2, 0);*/
	const arrow = new THREE.Mesh(
		new THREE.ShapeGeometry(arrowshape),
		materialarrow
	);
	arrow.rotation.x = -Math.PI / 2;
	arrow.position.y = 0.1;
	arrow.visible = false;
	scene.add(arrow);

if (debug) {
	debug = new CannonDebugRenderer(scene, world);
}

// players
	let players = {};
	let player;
	class Player {
		constructor(name, color) {
			this.name = name;
			this.color = color;
			this.lastsafe = new CANNON.Vec3();
			this.canshoot = true;
			this.inhole = false;
			const geometry = new THREE.IcosahedronGeometry(0.3, 5);
			const mesh = new THREE.Mesh(geometry, materialgolf);
			this.mesh = mesh;
			scene.add(mesh);
			const phi = new CANNON.Body({
				mass: 0.3,
				position: new CANNON.Vec3(0, 5, 0),
				shape: new CANNON.Sphere(0.3),
				material: phimaterialgolf,
				name: "hi"
			});
			phi.addEventListener("collide", this.collide)
			world.addBody(phi);
			this.phi = phi;
			this.phi.parent = this;
			players[name] = this;
		}
		collide(e, o) {
			console.log(e, o)
		}
		update(tx) {
			this.mesh.position.x   = this.phi.position.x;
			this.mesh.position.y   = this.phi.position.y;
			this.mesh.position.z   = this.phi.position.z;
			this.mesh.quaternion.x = this.phi.quaternion.x;
			this.mesh.quaternion.y = this.phi.quaternion.z;
			this.mesh.quaternion.z = this.phi.quaternion.y;
			this.mesh.quaternion.w = this.phi.quaternion.w;
			if (this.phi.position.y < -10) {
				this.phi.position.x = this.lastsafe.x;
				this.phi.position.y = this.lastsafe.y + 5;
				this.phi.position.z = this.lastsafe.z;
				this.phi.angularVelocity.x = this.phi.angularVelocity.y = this.phi.angularVelocity.z = this.phi.velocity.x = this.phi.velocity.y = this.phi.velocity.z = 0;
			} else if (Math.sqrt(
				this.phi.velocity.x ** 2 +
				this.phi.velocity.y ** 2 +
				this.phi.velocity.z ** 2
			) < 0.5) {
				this.phi.angularVelocity.x = this.phi.angularVelocity.y = this.phi.angularVelocity.z = this.phi.velocity.x = this.phi.velocity.z = 0;
				this.canshoot = true;
			} else {
				this.canshoot = false;
				this.phi.velocity.x *= 0.99 ** (tx / 15);
				this.phi.velocity.z *= 0.99 ** (tx / 15);
			}
		}
	}
	camerafollow = player = new Player("Solly", 0xFF0000)

const FLOOR    = 0;
const WALL     = 1;
const START    = 2;
const HOLE     = 3;
const BUMPER   = 4;
const SPINNER  = 5;
const TRIANGLE = 6;
const SQUARE   = 7;
const WIND     = 8;
let a;

function mapgen(mapdata) {
	let points, faces, type, geometry;
	let counthole  = 0; // track hole and start number (only 1 hole/start per course)
	let countstart = 0;
	mapdata.forEach(i => {
		if (a) return;
		type = i[0];
		i = i.slice(1);
		switch (type) {
			case FLOOR: {
				points = [];
				
				for (let m = 0; m < i.length; ++m) {
					// Generate the lower polygon of the floor
					points.push(new THREE.Vector3(i[m][0], i[m][2], i[m][1]));
					i[m][2] -= 60;
					// Generate the upper polygon of the floor
					points.push(new THREE.Vector3(i[m][0], i[m][2], i[m][1]));
				}
				geometry = new ConvexGeometry(points); // Convert the set of points into a polyhedron
				geometry.computeBoundingBox();
				let x, y; // y refers to z coordinate, x used as found flag
				for (let i = 0; i < mapdata.length; ++i) { // Find any holes in the floor
					if (
						mapdata[i][0] !== HOLE || // if the object is a hole
						geometry.boundingBox.min.x > mapdata[i][1][0] || // AABB collision check
						mapdata[i][1][0] > geometry.boundingBox.max.x ||
						geometry.boundingBox.min.y > mapdata[i][1][2] ||
						mapdata[i][1][2] > geometry.boundingBox.max.y ||
						geometry.boundingBox.min.z > mapdata[i][1][1] ||
						mapdata[i][1][1] > geometry.boundingBox.max.z
					) continue;
					x = mapdata[i][1][0]; // set coordinates
					y = mapdata[i][1][1];
				}
				if (x) { // if a hole is found within the floor
					for (let m = 0; m < 20; ++m) { // Icosagon (imitation of a circle)
						points.push(new THREE.Vector3( // Generate points around the hole in a circle
							x + Math.sin(Math.PI * 2 * (m / 20)) * 0.4,
							i[0][2] + 120.5, // raise these poinst into the air, use the +0.5 offset to show these points represent those around the hole
							y + Math.cos(Math.PI * 2 * (m / 20)) * 0.4
						));
					}
					geometry = mergeVertices(new ConvexGeometry(points)); // convert points into convex geometry
					points = [];
					
					for (let i = 0; i < geometry.attributes.position.count; ++i) { // Gather point indexes for hole
						pt = Math.round(geometry.attributes.position.array[i * 3 + 1] % 1 * 10);
						if (pt === 5) { // if so it is hole interior
							geometry.attributes.position.array[i * 3 + 1] -= 60.5; // set height of them back down
							points.push(i);
						}
					}
					let newpoints = [];
					faces = [];
					for (let i = 0; i < geometry.index.count / 3; ++i) { // reformat face indecies
						if (
							points.indexOf(geometry.index.array[i * 3 + 0]) !== -1 &&
							points.indexOf(geometry.index.array[i * 3 + 1]) !== -1 &&
							points.indexOf(geometry.index.array[i * 3 + 2]) !== -1
						) continue; // these faces are inside the hole, so ignore them
						// copy over vertices and faces
						newpoints = newpoints.concat([
							geometry.index.array[i * 3 + 0],
							geometry.index.array[i * 3 + 1],
							geometry.index.array[i * 3 + 2],
						]);
						faces.push([
							geometry.index.array[i * 3 + 0],
							geometry.index.array[i * 3 + 1],
							geometry.index.array[i * 3 + 2],
						]);
					}
					geometry.index.array = new Uint16Array(newpoints); // set verticies
					geometry.index.count = geometry.index.array.length;
				} else {
					geometry = mergeVertices(geometry, 0);
					faces = []; // reformat face indecies
					for (let i = 0; i < geometry.index.count / 3; ++i) {
						faces.push([
							geometry.index.array[i * 3 + 0],
							geometry.index.array[i * 3 + 1],
							geometry.index.array[i * 3 + 2],
						]);
					}
				}

				const mesh = new THREE.Mesh(geometry, materialfloor);
				points = []; // reformat point data back into vec3 for body
				for (let i = 0; i < geometry.attributes.position.count; ++i) {
					points.push(new CANNON.Vec3(
						geometry.attributes.position.array[i * 3 + 0],
						geometry.attributes.position.array[i * 3 + 1],
						geometry.attributes.position.array[i * 3 + 2],
					));
				}
				if (x) {
					// If the geometry was edited by the hole cutting, then we must recalculte the normals for proper lighting
					// TODO only calculate normals you must, this adds 0.5s to loading per floor
					geometry.computeVertexNormals(); 
				}
				scene.add(mesh);
				const phi = new CANNON.Body({
					mass: 0,
					restitution: 1,
					shape: new CANNON.ConvexPolyhedron(
						points,
						faces
					),
					material: phimaterialfloor
				});
				world.addBody(phi)
				break;
			} case WALL: {
				for (let m = 0; m < i.length - 1; ++m) { // for each adjacent pair of points (segment)
					const geometry = new THREE.BoxGeometry( // create a box
						0.5, 60,
						Math.sqrt( // dist(p1, p2)
							(i[m][0] - i[m + 1][0]) ** 2 +
							(i[m][1] - i[m + 1][1]) ** 2 +
							(i[m][2] - i[m + 1][2]) ** 2
						) + 0.5
					);
					const mesh = new THREE.Mesh(geometry, materialwall);
					mesh.position.x = i[m][0] - (i[m][0] - i[m + 1][0]) / 2; // set position of segment to mid(p1, p2)
					mesh.position.y = i[m][2] - (i[m][2] - i[m + 1][2]) / 2;
					mesh.position.z = i[m][1] - (i[m][1] - i[m + 1][1]) / 2;
					mesh.lookAt(i[m + 1][0], i[m + 1][2], i[m + 1][1]); // rotate wall facing p2
					mesh.position.y -= 29.5; // center in y axis
					mesh.castShadow = true;
					scene.add(mesh);
					const shape = new CANNON.Box(new CANNON.Vec3(
						geometry.parameters.width / 2,
						geometry.parameters.height / 2,
						geometry.parameters.depth / 2,
					));
					const phi = new CANNON.Body({ // create body using data from mesh
						mass: 0,
						shape: shape,
						position: new CANNON.Vec3(
							mesh.position.x,
							mesh.position.y,
							mesh.position.z,
						),
						quaternion: new CANNON.Quaternion(
							mesh.quaternion.x,
							mesh.quaternion.y,
							mesh.quaternion.z,
							mesh.quaternion.w,
						),
						material: phimaterialwall
					});
					world.addBody(phi);
				}
				break;
			} case HOLE: {
				{
					// Make the hole glow with a light
					// TODO: make it colored
					const light = new THREE.PointLight(0xFFFFFF, 0.1);
					light.position.set(i[0][0], i[0][2] + 50, i[0][1]);
					scene.add(light);
				}
				{
					// Open cylinder (top face missing) for the cup of the hole
					let mesh = new THREE.Mesh(
						new THREE.CylinderGeometry(0.4, 0.4, 1.6, 20, 1, true), 
						materialhole
					);
					mesh.position.x = i[0][0];
					mesh.position.y = i[0][2] - 0.8;
					mesh.position.z = i[0][1];
					scene.add(mesh);
					mesh = new THREE.Mesh(
						new THREE.CircleGeometry(0.4, 20), 
						materialhole
					);
					mesh.position.x = i[0][0];
					mesh.position.y = i[0][2] - 1.6;
					mesh.position.z = i[0][1];
					mesh.rotation.x = Math.PI / 2;
					scene.add(mesh); // TODO stick position and rotation into constructor
				}
				{
					// Open rectangle (top face missing) with faces pointed inwards for the collison of the cup of the hole
				    var points = [
						new CANNON.Vec3(-0.5, -0.8, -0.5),
						new CANNON.Vec3( 0.5, -0.8, -0.5),
						new CANNON.Vec3( 0.5,  0,   -0.5),
						new CANNON.Vec3(-0.5,  0,   -0.5),
						new CANNON.Vec3(-0.5, -0.8,  0.5),
						new CANNON.Vec3( 0.5, -0.8,  0.5),
						new CANNON.Vec3( 0.5,  0,    0.5),
						new CANNON.Vec3(-0.5,  0,    0.5),
				    ];
				    var faces = [
						[0,1,2,3], // -z
						[3,2,1,0], // -z
						[7,6,5,4], // +z
						[4,5,6,7], // +z
						[0,4,7,3], // -x
						[3,7,4,0], // -x
						[1,2,6,5], // +x
						[5,6,2,1], // +x
						[1,0,4,5], // -y
				    ];
					const phi = new CANNON.Body({
						mass: 0,
						shape: new CANNON.ConvexPolyhedron(
							points, faces
						),
						position: new CANNON.Vec3(i[0][0], i[0][2], i[0][1]),
						name: "hello"
					});
					phi.id = counthole + 20;
					world.add(phi);
				}
				counthole += 1;
				break;
			} case SQUARE: {
				const shape = new THREE.Shape();
				shape.moveTo(-1, -1);
				shape.lineTo(1, -1);
				shape.lineTo(1, 1);
				shape.lineTo(-1, 1);
				shape.lineTo(-1, -1);
				geometry = new THREE.ExtrudeGeometry(shape, {
					steps: 1,
					depth: 1,
					bevelEnabled: true,
					bevelThickness: 1,
					bevelSize: 1,
					bevelSegments: 5,
				});
				const mesh = new THREE.Mesh(
					geometry,
					materialnonbouncy
				);
				mesh.rotation.x = Math.PI / 2;
				mesh.position.x = i[0][0];
				mesh.position.y = i[0][2];
				mesh.position.z = i[0][1];
				scene.add(mesh);
				// TODO: add collision
				break;
			}
		}
	});
}
mapgen(w);
console.log("done")

let cameradir = [0, 0];
let cameradis = 20;

let tx, to = 0;
function frame(tt) {
	// update
		tx = tt - to;
		to = tt;
		Object.keys(players).forEach(i => {
			players[i].update(tx);
		});
		camera.position.y = camerafollow.mesh.position.y + Math.sin(-cameradir[1] / 50) * cameradis;
		camera.position.z = camerafollow.mesh.position.z + Math.cos(cameradir[0] / 50) * Math.cos(cameradir[1] / 50) * cameradis;
		camera.position.x = camerafollow.mesh.position.x + Math.sin(cameradir[0] / 50) * Math.cos(cameradir[1] / 50) * cameradis;
		camera.lookAt(camerafollow.mesh.position.x, camerafollow.mesh.position.y, camerafollow.mesh.position.z);
		camera.updateMatrixWorld();
		if (dragshoot) {
			arrow.visible = true;
			arrow.position.x = camerafollow.mesh.position.x;
			arrow.position.y = camerafollow.mesh.position.y;
			arrow.position.z = camerafollow.mesh.position.z;
			arrow.rotation.z = dragshoot[0];
			arrow.scale.y = (Math.round(dragshoot[1] / 10) - 1) / 5;
		}
		world.step(1 / 60, tx, 5);
		if (debug) {
			debug.update();
			if        (keys["w"]) {
				camerafollow.phi.velocity.x -= tx / 50  * Math.sin(cameradir[0] / 50);
				camerafollow.phi.velocity.z -= tx / 50  * Math.cos(cameradir[0] / 50);
			} else if (keys["s"]) {
				camerafollow.phi.velocity.x += tx / 50  * Math.sin(cameradir[0] / 50);
				camerafollow.phi.velocity.z += tx / 50  * Math.cos(cameradir[0] / 50);
			} if      (keys["a"]) {
				camerafollow.phi.velocity.x -= tx / 50  * Math.cos(cameradir[0] / 50);
				camerafollow.phi.velocity.z += tx / 50  * Math.sin(cameradir[0] / 50);
			} else if (keys["d"]) {
				camerafollow.phi.velocity.x += tx / 50  * Math.cos(cameradir[0] / 50);
				camerafollow.phi.velocity.z -= tx / 50  * Math.sin(cameradir[0] / 50);
			} if (keys[" "]) {
				camerafollow.phi.velocity.y += tx / 100;
			} if (keys["Shift"]) {
				camerafollow.phi.velocity.x = camerafollow.phi.velocity.y = camerafollow.phi.velocity.z = 0;
			}
		}
		render.render(scene, camera);
		window.requestAnimationFrame(frame);
}
let dragstart = undefined;
let dragend = [0, 0];
let dragshoot = undefined;
window.onpointerdown = () => {
	if (player.canshoot && Math.sqrt(
		(event.offsetX - window.innerWidth  / 2) ** 2 +
		(event.offsetY - window.innerHeight / 2) ** 2
	) < 100) {
		dragshoot = [0, 0];
		arrow.visible = true;
		return;
	}
	dragstart = [
		cameradir[0] + event.offsetX,
		cameradir[1] + event.offsetY
	];
}
window.onpointermove = () => {
	if (dragshoot) {
		let x = event.offsetX - window.innerWidth  / 2;
		let y = event.offsetY - window.innerHeight / 2;
		dragshoot[0] = Math.atan2(x, y) + cameradir[0] / 50;
		dragshoot[1] = Math.sqrt(x ** 2 + y ** 2);
		if (dragshoot[1] / 50 > 1) dragshoot[1] = 50
		console.log(dragshoot);
		return
	}
	if (!dragstart) return;
	cameradir[0] = dragstart[0] - event.offsetX;
	cameradir[1] = dragstart[1] - event.offsetY;
	if        (cameradir[1] > -10) {
		cameradir[1] = -10;
		dragstart[1] = event.layerY + cameradir[1];
	} else if (cameradir[1] < -70) {
		cameradir[1] = -70;
		dragstart[1] = event.layerY + cameradir[1];
	}
}
window.onpointerup = window.onpointerleave = window.onpointercancel = () => {
	if (dragshoot) {
		player.phi.velocity.x = -Math.sin(dragshoot[0]) * dragshoot[1] / 10;
		player.phi.velocity.z = -Math.cos(dragshoot[0]) * dragshoot[1] / 10;
		player.lastsafe.x = player.phi.position.x;
		player.lastsafe.y = player.phi.position.y;
		player.lastsafe.z = player.phi.position.z;
		dragshoot = undefined;
		arrow.visible = false;
		return;
	}
	dragstart = undefined;
};
window.onresize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	render.setSize(window.innerWidth, window.innerHeight);
}
window.onresize();
window.onmousewheel = () => {
	if (event.deltaY < 0) {
		if (cameradis > 5) cameradis -= 5;
	} else {
		cameradis += 5;
	}
}
window.onkeydown = () => {
	keys[event.key] = true;
}
window.onkeyup = () => {
	keys[event.key] = false;
}
window.requestAnimationFrame(frame);

