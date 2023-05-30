// NOTE: xyz is used when possible

// Import
import * as THREE from "../lib/three.module.min.js";
import * as CANNON from "../lib/cannon.min.js";
import CannonDebugRenderer from "../lib/cannon.dbg.js";
import Settings from "./settings.js";
import Multi from "./multi.js";
import { debugmove } from "./def.js";
import { Place, Player } from "./thing.js";
import { MapTutorial } from "./maps.js";

const can = document.getElementById("can"); // What we are drawing on
const e_rstroke  = document.getElementById("rstroke");

// Keys
let keys = {}; // Key Pair : Key Pressed
window.onkeydown = event => { 
	if (event.key === "Escape") {
		window.top.postMessage(["GAME"], "*");
		return;
	}
	keys[event.key] = true;
}; 
window.onkeyup = event => { keys[event.key] = false; }; 

// THREE.JS Setup
export const render = new THREE.WebGLRenderer({
	canvas: can
});
export const scene = new THREE.Scene();
scene.background = new THREE.Color(Settings.BGCOLOR);
scene.camera = new THREE.PerspectiveCamera(Settings.FOV, can.width / can.height, 0.1, Settings.RENDERDISTANCE);
scene.camera.rotation.order = "YXZ";
scene.camera.dir = [0, 0];
scene.camera.dis = 20;
scene.camera.dismov = 20;
scene.camera.start = undefined;
scene.camera.shoot = undefined;

{ // Hemisphere light
	const light = new THREE.HemisphereLight(0xFFFFFF, 0, 1, 1);
	scene.add(light);
}
{ // Fog
	if (Settings.FOG) {
		scene.fogmesh = new THREE.Object3D();
		scene.fogmaterial = new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,
			transparent: true,
			opacity: 0.1
		});
		const geometry = new THREE.PlaneGeometry(1024, 1024);
		for (let i = 1; i < 10; ++i) {
			const fog = new THREE.Mesh(geometry, scene.fogmaterial);
			fog.position.y = -10 - i;
			fog.rotation.x = Math.PI / -2;
			scene.fogmesh.add(fog);
		}
		scene.add(scene.fogmesh);
	}
}
window.onresize = () => {
	scene.camera.aspect = can.clientWidth / can.clientHeight;
	scene.camera.updateProjectionMatrix();
	render.setSize(can.clientWidth, can.clientHeight);
}
window.onresize();

// CANNON.JS Setup (very short)

export const world = new CANNON.World();
world.gravity.set(0, -1, 0) // m/s²
world.solver.iterations = 30;
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
		depthTest: false,
		depthWrite: false,
	})
);
arrow.rotation.x = Math.PI / -2;
arrow.visible = false;
arrow.renderOrder = 99999;
scene.add(arrow);
let debug;
if (Settings.DEBUGMESH) {
	debug = new CannonDebugRenderer(scene, world);
	debug.material.color.set(0xFF0000);
	debug.material.wireframeLinewidth = 15;
	debug.material.linewidth = 15;
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
		place.tick = Date.now() - start;
	// Update
		world.step(1 / fps, tx, 5);
		Multi.update(); // I'm a multiplayer now!
		let m, proj, l;
		for (let i = 0; i < place.mods.spin.length; ++i) {
			m = place.mods.spin[i];
			m.mesh.rotation.x = place.tick / 1000 * m.modspin[0];
			m.mesh.rotation.y = place.tick / 1000 * m.modspin[1];
			m.mesh.rotation.z = place.tick / 1000 * m.modspin[2];
			if (m.body) {
				m.body.quaternion.x = m.mesh.quaternion.x;
				m.body.quaternion.y = m.mesh.quaternion.y;
				m.body.quaternion.z = m.mesh.quaternion.z;
				m.body.quaternion.w = m.mesh.quaternion.w;
			}
		}
		for (let i = 0; i < place.mods.text.length; ++i) {
			m = place.mods.text[i];
			m.mesh.lookAt(scene.camera.position);
			//console.log(m.mesh)
			if (m.mesh.quaternion.angleTo(scene.camera.quaternion) < 0.01) continue;
			proj = m.mesh.position.clone().project(scene.camera);
			proj.x = ( proj.x + 1) / 2 * can.width;
			proj.y = (-proj.y + 1) / 2 * can.height;
			place.mods.text[i].text.style.transform = `translate(calc(${proj.x}px - 50%),calc(${proj.y}px - 50%))`;
		}
		for (let i = 0; i < place.players.length; ++i) place.players[i].onupdate(tx);
	// Arrow
		if (scene.camera.shoot) {
			arrow.position.x = scene.camera.follow.mesh.position.x;
			arrow.position.y = scene.camera.follow.mesh.position.y;
			arrow.position.z = scene.camera.follow.mesh.position.z;
			arrow.rotation.z = scene.camera.shoot[0];
			arrow.scale.y = Math.round(scene.camera.shoot[1] * 6);
			if (arrow.scale.y < 1) arrow.scale.y = 0;
			else                   arrow.scale.y /= 4;
		}
	// Debug Move
		if (debugmove) {
			if        (keys["w"]) {
				place.player.body.velocity.x -= tx / 20  * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
				place.player.body.velocity.z -= tx / 20  * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
			} else if (keys["s"]) {
				place.player.body.velocity.x += tx / 20  * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
				place.player.body.velocity.z += tx / 20  * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
			} if      (keys["a"]) {
				place.player.body.velocity.x -= tx / 20  * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
				place.player.body.velocity.z += tx / 20  * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
			} else if (keys["d"]) {
				place.player.body.velocity.x += tx / 20  * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
				place.player.body.velocity.z -= tx / 20  * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
			} if (keys[" "]) {
				place.player.body.velocity.y += tx / 100;
			} if (keys["Shift"]) {
				place.player.body.velocity.x = place.player.body.velocity.y = place.player.body.velocity.z = 0;
			}
		}
	// Camera
		scene.camera.dis = (scene.camera.dis + scene.camera.dismov) / 2;
		scene.camera.position.x = scene.camera.follow.mesh.position.x + Math.sin( scene.camera.dir[0] * Settings.SENSITIVITY) * Math.cos(scene.camera.dir[1] * Settings.SENSITIVITY) * scene.camera.dis;
		scene.camera.position.y = scene.camera.follow.mesh.position.y + Math.sin(-scene.camera.dir[1] * Settings.SENSITIVITY) * scene.camera.dis;
		scene.camera.position.z = scene.camera.follow.mesh.position.z + Math.cos( scene.camera.dir[0] * Settings.SENSITIVITY) * Math.cos(scene.camera.dir[1] * Settings.SENSITIVITY) * scene.camera.dis;
		scene.camera.lookAt(scene.camera.follow.mesh.position.x, scene.camera.follow.mesh.position.y, scene.camera.follow.mesh.position.z);
		scene.camera.updateMatrixWorld();
	// Render
		if (debug) debug.update();
		render.render(scene, scene.camera)
	window.requestAnimationFrame(frame);
}

// Drag / Zoom Behaviour
can.addEventListener("mousewheel", event => {
	scene.camera.dismov += event.deltaY / 10;
	if (scene.camera.dismov < 5)
		scene.camera.dismov = 5;
	else if (scene.camera.dismov > Settings.RENDERDISTANCE / 2)
		scene.camera.dismov = Settings.RENDERDISTANCE / 2;
}, { passive : true });

can.onpointerdown = event => {
	can.setPointerCapture(event.pointerId);
	if (place.player.isshoot && !place.player.ishole && scene.camera.follow === place.player && Math.sqrt(
		(event.offsetX - window.innerWidth  / 2) ** 2 +
		(event.offsetY - window.innerHeight / 2) ** 2
	) < 100) {
		scene.camera.shoot = [0, 0];
		arrow.visible = true;
		return;
	}
	scene.camera.start = [
		scene.camera.dir[0] + event.offsetX,
		scene.camera.dir[1] + event.offsetY
	];
};
can.onpointerup = can.onpointercancel = () => {
	can.releasePointerCapture(event.pointerId);
	if (scene.camera.shoot) {
		if (arrow.scale.y > 0) {
			place.player.body.velocity.x = -Math.sin(scene.camera.shoot[0]) * scene.camera.shoot[1] * 7;
			place.player.body.velocity.z = -Math.cos(scene.camera.shoot[0]) * scene.camera.shoot[1] * 7;
			place.player.lastsafe.x = place.player.body.position.x;
			place.player.lastsafe.y = place.player.body.position.y;
			place.player.lastsafe.z = place.player.body.position.z;
			Multi.hit();
			place.player.onhit();
			e_rstroke.innerHTML = place.player.stroke;
		}
		scene.camera.shoot = undefined;
		arrow.visible = false;
		return;
	}
	scene.camera.start = undefined;
};
can.onpointermove = event => {
	if (scene.camera.shoot) {
		let x = event.offsetX - window.innerWidth  / 2;
		let y = event.offsetY - window.innerHeight / 2;
		scene.camera.shoot[0] = Math.atan2(x, y) + scene.camera.dir[0] * Settings.SENSITIVITY;
		scene.camera.shoot[1] = Math.sqrt(x ** 2 + y ** 2) * Settings.SENSITIVITY;
		if (scene.camera.shoot[1] > 1) scene.camera.shoot[1] = 1;
		return
	}
	if (!scene.camera.start) return;
	scene.camera.dir[0] = scene.camera.start[0] - event.offsetX;
	scene.camera.dir[1] = scene.camera.start[1] - event.offsetY;
	if (scene.camera.dir[1] > -0.1) {
		scene.camera.dir[1] = -0.1;
		scene.camera.start[1] = event.layerY + scene.camera.dir[1];
	} else if (scene.camera.dir[1] * Settings.SENSITIVITY < Math.PI / -2 + 0.1) {
		scene.camera.dir[1] = (Math.PI / -2 + 0.1) / Settings.SENSITIVITY;
		scene.camera.start[1] = event.layerY + scene.camera.dir[1];
	}
};

// Main

let data = MapTutorial;
console.log(data)

export const place = new Place();
place.world = world;
place.scene = scene;
place.setdata(data);
place.add();
place.addplayer(Settings.NAME, Settings.COLOR, true);
place.sethole(0);
Multi.ready();

window.requestAnimationFrame(frame);

window.onmessage = event => {
	console.log(event.data)
	if (event.data[0] !== "MAIN") return;
	Multi.newmap(event.data[1]);
	place.setdata(event.data[1]);
	place.players.forEach(i => i.reset);
	place.add();
};

if (debugmove) {
	window.player = place.player;
	window.place = place;
	window.CANNON = CANNON;
	window.THREE = THREE;
}