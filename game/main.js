// NOTE: xyz is used when possible

const can = document.getElementById("can"); // What we are drawing on
const playertext = document.getElementById("playertext"); // To use as a canvas for player names

// Keys
let keys = {}; // Key Pair : Key Pressed
window.onkeydown = () => { 
	if (event.key === "Escape") {
		window.top.postMessage(["GAME"], "*");
		return;
	}
	keys[event.key] = true;
}; 
window.onkeyup = () => { keys[event.key] = false; }; 

// THREE.JS Setup
const render = new THREE.WebGLRenderer({
	canvas: can
});
const scene = new THREE.Scene();
scene.background = new THREE.Color(Settings.BGCOLOR);
const camera = new THREE.PerspectiveCamera(Settings.FOV, can.width / can.height, 0.1, Settings.RENDERDISTANCE);
camera.rotation.order = "YXZ";
camera.dir = [0, 0];
camera.dis = 20;
camera.start = undefined;
camera.shoot = undefined;

{ // Hemisphere light
	const light = new THREE.HemisphereLight(0xFFFFFF, 0, 1, 1);
	scene.add(light);
}
{ // Fog
	if (Settings.FOG) {
		const material = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0.1
		});
		const geometry = new THREE.PlaneGeometry(1024, 1024);
		for (let i = 1; i < 10; ++i) {
			const fog = new THREE.Mesh(geometry, material);
			fog.position.y = -10 - i;
			fog.rotation.x = Math.PI / -2;
			scene.add(fog);
		}
	}
}
window.onresize = () => {
	camera.aspect = can.clientWidth / can.clientHeight;
	camera.updateProjectionMatrix();
	render.setSize(can.clientWidth, can.clientHeight);
}
window.onresize();

// CANNON.JS Setup (very short)

const world = new CANNON.World();
world.gravity.set(0, -1, 0) // m/s²
world.solver.iterations = 20;
world.allowSleep = true;

// Special objects
const arrow = new THREE.Mesh(
	new THREE.ShapeGeometry(new THREE.Shape([
		new THREE.Vector2(-0.2, 0),
		new THREE.Vector2(0.2, 0),
		new THREE.Vector2(0.2, 5),
		new THREE.Vector2(0.5, 5),
		new THREE.Vector2(0, 5.5),
		new THREE.Vector2(-0.5, 5),
		new THREE.Vector2(-0.2, 5),
		new THREE.Vector2(-0.2, 0),
	])), 
	new THREE.MeshStandardMaterial({
		color: Settings.COLOR,
		depthTest: false
	})
);

// COME BACK
arrow.rotation.x = Math.PI / -2;
arrow.visible = false;
arrow.renderOrder = 100;
scene.add(arrow);
const player = new Player(Settings.NAME, Settings.COLOR);
camera.follow = player; // what the camera will follow
let debug;
if (Settings.DEBUGMESH) {
	debug = new CannonDebugRenderer(scene, world);
}

// Frame
let start = Date.now();
let tx, to = 0, tick = 0, fps;
function frame(tt) {
	// Time
		tx = tt - to;
		fps = 1000 / tx;
		if (Settings.MAXFPS > 0 && fps > Settings.MAXFPS) {
			window.requestAnimationFrame(frame);
			return;
		}
		to = tt;
		tick = Date.now() - start;
		
	// Update
		for (let i = 0; i < place.things.length; ++i) {
			if (place.things[i].onupdate) place.things[i].onupdate();
		}
		for (let i = 0; i < players.length; ++i) {
			players[i].onupdate();
		}
		world.step(1 / fps, tx, 5);
		Multi.update(); // I'm a multiplayer now!
		
	// Arrow
		if (camera.shoot) {
			arrow.position.x = camera.follow.mesh.position.x;
			arrow.position.y = camera.follow.mesh.position.y;
			arrow.position.z = camera.follow.mesh.position.z;
			arrow.rotation.z = camera.shoot[0];
			arrow.scale.y = Math.round(camera.shoot[1] * 6);
			if (arrow.scale.y < 1) arrow.scale.y = 0;
			else                   arrow.scale.y /= 4;
		}
	// Debug Move
		if (debugmove) {
			if        (keys["w"]) {
				player.body.velocity.x -= tx / 20  * Math.sin(camera.dir[0] * Settings.SENSITIVITY);
				player.body.velocity.z -= tx / 20  * Math.cos(camera.dir[0] * Settings.SENSITIVITY);
			} else if (keys["s"]) {
				player.body.velocity.x += tx / 20  * Math.sin(camera.dir[0] * Settings.SENSITIVITY);
				player.body.velocity.z += tx / 20  * Math.cos(camera.dir[0] * Settings.SENSITIVITY);
			} if      (keys["a"]) {
				player.body.velocity.x -= tx / 20  * Math.cos(camera.dir[0] * Settings.SENSITIVITY);
				player.body.velocity.z += tx / 20  * Math.sin(camera.dir[0] * Settings.SENSITIVITY);
			} else if (keys["d"]) {
				player.body.velocity.x += tx / 20  * Math.cos(camera.dir[0] * Settings.SENSITIVITY);
				player.body.velocity.z -= tx / 20  * Math.sin(camera.dir[0] * Settings.SENSITIVITY);
			} if (keys[" "]) {
				player.body.velocity.y += tx / 100;
			} if (keys["Shift"]) {
				player.body.velocity.x = player.body.velocity.y = player.body.velocity.z = 0;
			}
		}
	// Camera
		camera.position.x = camera.follow.mesh.position.x + Math.sin( camera.dir[0] * Settings.SENSITIVITY) * Math.cos(camera.dir[1] * Settings.SENSITIVITY) * camera.dis;
		camera.position.y = camera.follow.mesh.position.y + Math.sin(-camera.dir[1] * Settings.SENSITIVITY) * camera.dis;
		camera.position.z = camera.follow.mesh.position.z + Math.cos( camera.dir[0] * Settings.SENSITIVITY) * Math.cos(camera.dir[1] * Settings.SENSITIVITY) * camera.dis;
		camera.lookAt(camera.follow.mesh.position.x, camera.follow.mesh.position.y, camera.follow.mesh.position.z);
		camera.updateMatrixWorld();
	// Render
		if (debug) debug.update();
		render.render(scene, camera)
	window.requestAnimationFrame(frame);
}

// Drag / Zoom Behaviour
can.addEventListener("mousewheel", () => {
	if (event.deltaY < 0) {
		if (camera.dis > 5) camera.dis -= 5;
	} else {
		camera.dis += 5;
	}
}, { passive : true });
can.onpointerdown = () => {
	if (player.isshoot && !player.ishole && camera.follow === player && Math.sqrt(
		(event.offsetX - window.innerWidth  / 2) ** 2 +
		(event.offsetY - window.innerHeight / 2) ** 2
	) < 100) {
		camera.shoot = [0, 0];
		arrow.visible = true;
		return;
	}
	camera.start = [
		camera.dir[0] + event.offsetX,
		camera.dir[1] + event.offsetY
	];
};
can.onpointerup = can.onpointerleave = can.onpointercancel = () => {
	if (camera.shoot) {
		if (arrow.scale.y > 0) {
			player.body.velocity.x = -Math.sin(camera.shoot[0]) * camera.shoot[1] * 7;
			player.body.velocity.z = -Math.cos(camera.shoot[0]) * camera.shoot[1] * 7;
			player.lastsafe.x = player.body.position.x;
			player.lastsafe.y = player.body.position.y;
			player.lastsafe.z = player.body.position.z;
			Multi.hit();
			player.hit();
		}
		camera.shoot = undefined;
		arrow.visible = false;
		return;
	}
	camera.start = undefined;
};
can.onpointermove = () => {
	if (camera.shoot) {
		let x = event.offsetX - window.innerWidth  / 2;
		let y = event.offsetY - window.innerHeight / 2;
		camera.shoot[0] = Math.atan2(x, y) + camera.dir[0] * Settings.SENSITIVITY;
		camera.shoot[1] = Math.sqrt(x ** 2 + y ** 2) * Settings.SENSITIVITY;
		if (camera.shoot[1] > 1) camera.shoot[1] = 1;
		return
	}
	if (!camera.start) return;
	camera.dir[0] = camera.start[0] - event.offsetX;
	camera.dir[1] = camera.start[1] - event.offsetY;
	if (camera.dir[1] > -0.1) {
		camera.dir[1] = -0.1;
		camera.start[1] = event.layerY + camera.dir[1];
	} else if (camera.dir[1] * Settings.SENSITIVITY < Math.PI / -2 + 0.1) {
		camera.dir[1] = (Math.PI / -2 + 0.1) / Settings.SENSITIVITY;
		camera.start[1] = event.layerY + camera.dir[1];
	}
};

// Main

data =
[[16755285,15636821,14522709,16733474],[0,[-1,-2,-13],[1,-2,-13],[1,-2,-11],[-1,-2,-11]],[3,[0,-2,-12]],[0,[1,-3,-13],[3,-3,-13],[3,-3,-11],[1,-3,-11]],[3,[2,-3,-12]],[0,[3,-4,-13],[5,-4,-13],[5,-4,-11],[3,-4,-11]],[3,[4,-4,-12]],[0,[5,-5,-13],[7,-5,-13],[7,-5,-11],[5,-5,-11]],[3,[6,-5,-12]],[0,[7,-6,-13],[9,-6,-13],[9,-6,-11],[7,-6,-11]],[3,[8,-6,-12]],[0,[9,-7,-13],[11,-7,-13],[11,-7,-11],[9,-7,-11]],[3,[10,-7,-12]],[0,[-1,0,-11],[-1,0,1],[11,0,1],[11,0,-11]],[2,[0,0,0]],[2,[2,0,0]],[2,[4,0,0]],[2,[6,0,0]],[2,[8,0,0]],[2,[10,0,0]],[1,[-1,0,-11],[-1,0,-13],[11,0,-13],[11,0,1],[-1,0,1]],[0,[-1,-1,1],[-13,-1,1],[-13,-1,-13],[-1,-1,-13]],[1,[-1,-1,-13],[-13,-1,-13],[-13,-1,1]],[4,[-12,-1,-12]],[4,[-2,-1,-12]],[4,[-12,-1,0]],[7,[-7,-1,-12]],[7,[-12,-1,-6]],[0,[-13,-2,1],[-13,-2,15],[-1,-2,15],[-1,-2,1]],[1,[-13,-2,1],[-13,-2,15],[-1,-2,15]],[5,[-12,-2,2]],[5,[-2,-2,14]],[5,[-12,-2,14]],[6,[-7,-2,14]],[6,[-12,-2,8]],[0,[-1,-3,15],[11,-3,15],[11,-3,1],[-1,-3,1]],[1,[-1,-3,15],[11,-3,15],[11,-3,1]],[8,[-2,-1,0]],[8,[-2,-2,2]],[0,[-1,0,-9],[-1,0,-3],[-3,-1,-3],[-3,-1,-9]],[0,[-9,-1,1],[-5,-1,1],[-5,-2,3],[-9,-2,3]],[0,[-1,-2,5],[-1,-2,11],[1,-3,11],[1,-3,5]]]
//[[16755285,15636821,14522709,16733474],[0,[-9,1,-31],[3,1,-31],[3,1,-20],[-9,1,-20]],[0,[-9,1,-20],[3,1,-20],[3,0,-9],[-9,0,-9]],[0,[3,0,-9],[3,0,3],[-9,0,3],[-9,0,-9]],[1,[-9,1,-20]],[1,[-9,1,-20],[-9,1,-31],[3,1,-31],[3,1,-20],[3,0,-8],[3,0,3],[-9,0,3],[-9,0,-9],[-9,1,-20]],[2,[0,0,0]],[6,[-6,0,0]],[6,[0,1,-28]],[3,[-6,1,-28]]];
place = new Place(data);
place.add();

window.requestAnimationFrame(frame);

window.onmessage = () => {
	console.log(event.data)
	if (event.data[0] !== "MAIN") return;
	Multi.newmap(event.data[1]);
	place.del();
	place = new Place(event.data[1]);
	place.add();
	players.forEach(i => {
		i.reset();
	});
};
