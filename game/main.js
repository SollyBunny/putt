
import * as THREE from "../lib/three.js";
import * as CANNON from "../lib/cannon.js";

import Settings from "./settings.js";
import * as multi from "./multi.js";

import { scene, world, render, camera, tick } from "./engine.js"
import * as place from "./place.js";

function frame() {
	tick();
	window.requestAnimationFrame(frame);
}

function start() {
	window.requestAnimationFrame(frame);
}

multi.connect().then(start);

window.scene = scene;
window.world = world;
window.render = render;
window.camera = camera;
window.place = place;

window.THREE = THREE;
window.CANNON = CANNON;

window.onmessage = event => {
	console.log(event.data)
	if (event.data[0] !== "MAIN") return;
	place.multi.playtest(event.data[1]);
};

// // NOTE: xyz is used when possible

// // Import
// import * as THREE from "../lib/three.module.min.js";
// import * as CANNON from "../lib/cannon.min.js";
// import CannonDebugRenderer from "../lib/cannon.dbg.js";
// import Settings from "./settings.js";
// import Multi from "./multi.js";
// import { debug } from "./def.js";
// import { Place } from "./thing.js";
// import { ConfettiManager } from "../lib/three.ext.js"

// const can = document.getElementById("can"); // What we are drawing on
// const cantext = document.getElementById("text");
// const ctxtext = cantext.getContext("2d");

// const e_rpos = document.getElementById("rpos");
// const e_rvel = document.getElementById("rvel");
// const e_debug = document.getElementById("debug");
// let debugmesh;
// let debugmeshenabled = false;
// let fpsenabled = false;

// // Keys

// // THREE.JS Setup
// export const render = new THREE.WebGLRenderer({
// 	canvas: can
// });
// export const scene = new THREE.Scene();
// scene.background = new THREE.Color(Settings.BGCOLOR);
// scene.camera = new THREE.PerspectiveCamera(Settings.FOV, can.width / can.height, 0.1, Settings.RENDERDISTANCE);
// scene.camera.rotation.order = "YXZ";
// scene.camera.dir = [0, 0];
// scene.camera.dis = 20;
// scene.camera.dismov = 20;
// scene.camera.start = undefined;
// scene.camera.shoot = undefined;
// scene.camera.frustum = new THREE.Frustum();

// { // Hemisphere light
// 	const light = new THREE.HemisphereLight(0xFFFFFF, 0, 1, 1);
// 	scene.add(light);
// }
// { // Fog
// 	if (Settings.FOG) {
// 		scene.fogmesh = new THREE.Object3D();
// 		scene.fogmaterial = new THREE.MeshBasicMaterial({
// 			color: 0xFFFFFF,
// 			transparent: true,
// 			opacity: 0.5,
// 			side: THREE.DoubleSide
// 
// 		});
// 		const geometry = new THREE.PlaneGeometry(1024, 1024);
// 		for (let i = 1; i < 10; ++i) {
// 			const fog = new THREE.Mesh(geometry, scene.fogmaterial);
// 			fog.position.y = -10 - i * 2;
// 			fog.rotation.x = Math.PI / -2;
// 			scene.fogmesh.add(fog);
// 		}
// 		scene.add(scene.fogmesh);
// 	}
// }
// { // Dust
// 	if (Settings.DUST) {
// 		const particlesnum = 500;
// 		const particlespos = new Float32Array(particlesnum * 3);
// 		const particlesvel = new Float32Array(particlesnum * 3);
// 		for (let i = 0; i < particlesnum * 3; i += 3) {
// 			particlespos[i    ] = Math.random() * 100 - 50;
// 			particlespos[i + 1] = Math.random() * 50 - 10;
// 			particlespos[i + 2] = Math.random() * 100 - 50;
// 		}
// 		scene.dustmesh = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(particlespos, 3)), new THREE.PointsMaterial({
// 			color: 0xFFFFFF,
// 			size: 0.1,
// 			sizeAttenuation: true
// 		}));
// 		scene.dustmesh.num = particlesnum;
// 		scene.dustmesh.pos = particlespos;
// 		scene.dustmesh.vel = particlesvel;
// 		scene.add(scene.dustmesh);
// 	}
// }
// { // Confetti
// 	scene.confetti = new ConfettiManager(
// 		scene,
// 		[0xFF0000, 0xFFFF00, 0x00FF00, 0x0000FF],
// 		100,
// 		10
// 	);
// }

// window.onresize = () => {
// 	scene.camera.aspect = can.clientWidth / can.clientHeight;
// 	scene.camera.updateProjectionMatrix();
// 	render.setSize(can.clientWidth, can.clientHeight);
// 	cantext.width = can.clientWidth;
// 	cantext.height = can.clientHeight;
// }
// window.onresize();

// // CANNON.JS Setup (very short)

// export const world = new CANNON.World();
// world.gravity.set(0, -1, 0) // m/s²
// world.solver.iterations = 30;

// // Special objects
// const arrow = new THREE.Mesh(
// 	new THREE.ShapeGeometry(new THREE.Shape([
// 		new THREE.Vector2(-0.2, 0),
// 		new THREE.Vector2(0.2, 0),
// 		new THREE.Vector2(0.2, 5),
// 		new THREE.Vector2(0.5, 5),
// 		new THREE.Vector2(0, 5.5),
// 		new THREE.Vector2(-0.5, 5),
// 		new THREE.Vector2(-0.2, 5),
// 		new THREE.Vector2(-0.2, 0),
// 	])), 
// 	new THREE.MeshStandardMaterial({
// 		color: Settings.COLOR,
// 		depthTest: false,
// 		depthWrite: false,
// 		transparent: true
// 	})
// );
// arrow.rotation.x = Math.PI / -2;
// arrow.visible = false;
// arrow.renderOrder = 1000;
// scene.add(arrow);

// // Frame
// let start = Date.now();
// let tx, to = 0, tick = 0, fps;

// function frame(tt) {
// 	// Time
// 		tx = tt - to;
// 		fps = 1000 / tx;
// 		if (Settings.MAXFPS > 0 && fps > Settings.MAXFPS) {
// 			window.requestAnimationFrame(frame);
// 			return;
// 		}
// 		to = tt;
// 		place.tick = Date.now() - start;
// 	// Arrow
// 		if (scene.camera.shoot) {
// 			arrow.position.x = scene.camera.follow.mesh.position.x;
// 			arrow.position.y = scene.camera.follow.mesh.position.y;
// 			arrow.position.z = scene.camera.follow.mesh.position.z;
// 			if (scene.camera.shoot[1] === 1) {
// 				const h = place.tick / 100 % 6;
// 				const x = 1 - Math.abs((h % 2) - 1);
// 				if (h < 1) {
// 					arrow.material.color.r = 1;
// 					arrow.material.color.g = x;
// 					arrow.material.color.b = 0;
// 				} else if (h < 2) {
// 					arrow.material.color.r = x;
// 					arrow.material.color.g = 1;
// 					arrow.material.color.b = 0;
// 				} else if (h < 3) {
// 					arrow.material.color.r = 0;
// 					arrow.material.color.g = 1;
// 					arrow.material.color.b = x;
// 				} else if (h < 4) {
// 					arrow.material.color.r = 0;
// 					arrow.material.color.g = x;
// 					arrow.material.color.b = 1;
// 				} else if (h < 5) {
// 					arrow.material.color.r = x;
// 					arrow.material.color.g = 0;
// 					arrow.material.color.b = 1;
// 				} else {
// 					arrow.material.color.r = 1;
// 					arrow.material.color.g = 0;
// 					arrow.material.color.b = x;
// 				}
// 			} else {
// 				arrow.material.color.r = scene.camera.follow.mesh.material.color.r * scene.camera.shoot[1] * 2;
// 				arrow.material.color.g = scene.camera.follow.mesh.material.color.g * scene.camera.shoot[1] * 2;
// 				arrow.material.color.b = scene.camera.follow.mesh.material.color.b * scene.camera.shoot[1] * 2;
// 			}
// 			arrow.rotation.z = scene.camera.shoot[0];
// 			arrow.scale.y = Math.round(scene.camera.shoot[1] * 6);
// 			if (arrow.scale.y < 1) arrow.scale.y = 0;
// 			else                   arrow.scale.y /= 4;
// 		}
// 	// Debug Move
// 		if (debug) {
// 			if        (keys["w"]) {
// 				place.player.body.velocity.x -= tx / 20 * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
// 				place.player.body.velocity.z -= tx / 20 * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
// 			} else if (keys["s"]) {
// 				place.player.body.velocity.x += tx / 20 * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
// 				place.player.body.velocity.z += tx / 20 * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
// 			} if      (keys["a"]) {
// 				place.player.body.velocity.x -= tx / 20 * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
// 				place.player.body.velocity.z += tx / 20 * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
// 			} else if (keys["d"]) {
// 				place.player.body.velocity.x += tx / 20 * Math.cos(scene.camera.dir[0] * Settings.SENSITIVITY);
// 				place.player.body.velocity.z -= tx / 20 * Math.sin(scene.camera.dir[0] * Settings.SENSITIVITY);
// 			} if (keys[" "]) {
// 				place.player.body.velocity.y += tx / 100;
// 			} if (keys["shift"]) {
// 				place.player.body.velocity.x = place.player.body.velocity.y = place.player.body.velocity.z = 0;
// 			}
// 		}
// 	// Update
// 		world.step(1 / fps, tx, 5);
// 		place.update(tx);
// 	// Camera
// 		if (place.player.isshoot || fpsenabled === false) {
// 			scene.camera.dis = (scene.camera.dis + scene.camera.dismov) / 2;
// 			scene.camera.position.x = Math.sin( scene.camera.dir[0] * Settings.SENSITIVITY) * Math.cos(scene.camera.dir[1] * Settings.SENSITIVITY) * scene.camera.dis;
// 			scene.camera.position.y = Math.sin(-scene.camera.dir[1] * Settings.SENSITIVITY) * scene.camera.dis;
// 			scene.camera.position.z = Math.cos( scene.camera.dir[0] * Settings.SENSITIVITY) * Math.cos(scene.camera.dir[1] * Settings.SENSITIVITY) * scene.camera.dis;
// 			if (keys["c"]) {
// 				scene.camera.position.x *= 0.25;
// 				scene.camera.position.y *= 0.25;
// 				scene.camera.position.z *= 0.25;
// 			}
// 			scene.camera.position.x += scene.camera.follow.mesh.position.x;
// 			scene.camera.position.y += scene.camera.follow.mesh.position.y;
// 			scene.camera.position.z += scene.camera.follow.mesh.position.z;
// 			scene.camera.lookAt(scene.camera.follow.mesh.position.x, scene.camera.follow.mesh.position.y, scene.camera.follow.mesh.position.z);
// 		} else {
// 			scene.camera.position.x = scene.camera.follow.mesh.position.x;
// 			scene.camera.position.y = scene.camera.follow.mesh.position.y + 0.5;
// 			scene.camera.position.z = scene.camera.follow.mesh.position.z;
// 			scene.camera.rotation.x = scene.camera.rotation.z = 0;
// 			if (Math.abs(scene.camera.follow.body.velocity.x) < 0.1 && Math.abs(scene.camera.follow.body.velocity.z) < 0.1)
// 				scene.camera.rotation.ynew = scene.camera.dir[0] * Settings.SENSITIVITY;
// 			else
// 				scene.camera.rotation.ynew = Math.atan2(-scene.camera.follow.body.velocity.x, -scene.camera.follow.body.velocity.z);
// 			scene.camera.rotation.y = (scene.camera.rotation.y + scene.camera.rotation.ynew) / 2;
// 		}
// 		scene.camera.updateMatrixWorld();
// 	// Particles
// 		if (Settings.DUST) {
// 			let n;
// 			let p = new THREE.Vector3();
// 			for (let i = 0; i < scene.dustmesh.pos.length; i += 3) {
// 				n = Math.random();
// 				if (n < 0.1) {
// 					scene.dustmesh.vel[i + 1] += n - 0.05;
// 				} else if (n < 0.2) {
// 					scene.dustmesh.vel[i] += n - 0.1;
// 				} else if (n < 0.3) {
// 					scene.dustmesh.vel[i + 2] += n - 0.15;
// 				} else if (n < 0.6) {
// 					p.x = scene.dustmesh.pos[i    ];
// 					p.y = scene.dustmesh.pos[i + 1];
// 					p.z = scene.dustmesh.pos[i + 2];
// 					if (!scene.camera.frustum.containsPoint(p)) {
// 						scene.dustmesh.pos[i    ] = scene.camera.position.x + Math.random() * 100 - 50;
// 						scene.dustmesh.pos[i + 1] = scene.camera.position.y + Math.random() * 50 - 25;
// 						scene.dustmesh.pos[i + 2] = scene.camera.position.z + Math.random() * 100 - 50;
// 						scene.dustmesh.vel[i] = scene.dustmesh.vel[i + 1] = scene.dustmesh.vel[i + 2] = 0;
// 						continue;
// 					}
// 				}
// 				scene.dustmesh.pos[i    ] += scene.dustmesh.vel[i    ];
// 				scene.dustmesh.pos[i + 1] += scene.dustmesh.vel[i + 1];
// 				scene.dustmesh.pos[i + 2] += scene.dustmesh.vel[i + 2];
// 			}
// 			scene.dustmesh.geometry.attributes.position.needsUpdate = true;
// 		}
// 		scene.confetti.update();
// 	// Text
// 		ctxtext.clearRect(0, 0, cantext.width, cantext.height);
// 		//set text style
// 		ctxtext.font = "24px Varela";
// 		ctxtext.fillStyle = "white";
// 		ctxtext.textAlign = "center";
// 		ctxtext.textBaseline = "middle";
// 		for (let i = 0; i < place.mods.text.length; ++i) {
// 			const m = place.mods.text[i];
// 			if (m.mesh.visible = scene.camera.frustum.containsPoint(m.mesh.position)) {
// 				const proj = m.mesh.position.clone().project(scene.camera);
// 				proj.x = ( proj.x + 1) / 2 * can.width;
// 				proj.y = (-proj.y + 1) / 2 * can.height;
// 				ctxtext.fillText(m.text, Math.floor(proj.x), Math.floor(proj.y));
// 			}
// 		}
// 		ctxtext.font = "26px Varela";
// 		for (const player of place.players) {
// 			if (player.mesh.visible = scene.camera.frustum.containsPoint(player.mesh.position)) {
// 				const proj = player.mesh.position.clone().project(scene.camera);
// 				proj.x = ( proj.x + 1) / 2 * can.width;
// 				proj.y = (-proj.y + 1) / 2 * can.height - 50 * Math.cos(camera.rotation.x);
// 				ctxtext.fillText(player.name, Math.floor(proj.x), Math.floor(proj.y));
// 			}
// 		}
// 	// Multi
// 		if (place.player.isshoot === false && place.player.ishole === false)
// 			multi.update(); // I'm a multiplayer now!
// 	// Render
// 		if (debugmeshenabled) {
// 			debugmesh.update();
// 			e_rpos.textContent = `${Math.round(place.player.body.position.x * 100) / 100}, ${Math.round(place.player.body.position.y * 100) / 100}, ${Math.round(place.player.body.position.z * 100) / 100}`;
// 			e_rvel.textContent = `${Math.round(place.player.body.velocity.x * 100) / 100}, ${Math.round(place.player.body.velocity.y * 100) / 100}, ${Math.round(place.player.body.velocity.z * 100) / 100}`;
// 		}
// 		render.render(scene, scene.camera);
// 	window.requestAnimationFrame(frame);
// }

// // Drag / Zoom Behaviour
// can.addEventListener("wheel", event => {
// 	scene.camera.dismov += event.deltaY / 10;
// 	if (scene.camera.dismov < 5)
// 		scene.camera.dismov = 5;
// 	else if (scene.camera.dismov > Settings.RENDERDISTANCE / 2)
// 		scene.camera.dismov = Settings.RENDERDISTANCE / 2;
// }, { passive : true });

// can.onpointerdown = event => {
// 	can./*setPointerCapture(event.pointerId);
// 	if (place.player.isshoot && !place.player.ishole && scene.camera.follow === place.player && Math.sqrt(
// 		(event.offsetX - window.innerWidth  / 2) ** 2 +
// 		(event.offsetY - window.innerHeight / 2) ** 2
// 	) < 100) {
// 		scene.camera.shoot = [0, 0];
// 		arrow.visible = true;
// 		return;
// 	}
// 	scene.camera.start = [
// 		scene.camera.dir[0] + event.offsetX,
// 		scene.camera.dir[1] + event.offsetY
// 	];
// };
// can.onpointerup = can.onpointercancel = () => {
// 	can.releasePointerCapture(event.pointerId);
// 	if (scene.camera.shoot) {
// 		if (arrow.scale.y > 0) {
// 			place.player.body.velocity.x = -Math.sin(scene.camera.shoot[0]) * scene.camera.shoot[1] * 10;
// 			place.player.body.velocity.z = -Math.cos(scene.camera.shoot[0]) * scene.camera.shoot[1] * 10;
// 			place.player.lastsafe.x = place.player.body.position.x;
// 			place.player.lastsafe.y = place.player.body.position.y;
// 			place.player.lastsafe.z = place.player.body.position.z;
// 			multi.hit();
// 			place.player.onhit();
// 		}
// 		scene.camera.shoot = undefined;
// 		arrow.visible = false;
// 		return;
// 	}
// 	scene.camera.start = undefined;
// };
// can.onpointermove = event => {
// 	if (scene.camera.shoot) {
// 		let x = event.offsetX - window.innerWidth  / 2;
// 		let y = event.offsetY - window.innerHeight / 2;
// 		scene.camera.shoot[0] = Math.atan2(x, y) + scene.camera.dir[0] * Settings.SENSITIVITY;
// 		scene.camera.shoot[1] = Math.sqrt(x ** 2 + y ** 2) * Settings.SENSITIVITY;
// 		if  (scene.camera.shoot[1] > 1) scene.camera.shoot[1] = 1;
// 		return
// 	}
// 	if (!scene.camera.start) return;
// 	scene.camera.dir[0] = scene.camera.start[0] - event.offsetX;
// 	scene.camera.dir[1] = scene.camera.start[1] - event.offsetY;
// 	if (scene.camera.dir[1] > -0.1) {
// 		scene.camera.dir[1] = -0.1;
// 		scene.camera.start[1] = event.layerY + scene.camera.dir[1];
// 	} else if (scene.camera.dir[1] * Settings.SENSITIVITY < Math.PI / -2 + 0.1) {
// 		scene.camera.dir[1] = (Math.PI / -2 + 0.1) / Settings.SENSITIVITY;
// 		scene.camera.start[1] = event.layerY + scene.camera.dir[1];
// 	}
// };

// // Main

// export const place = new Place(scene, world);
// place.addplayer(Settings.NAME, Settings.COLOR, true);
// export const multi = new Multi(place, document.location.search.slice(1), (multi, hole) => {
// 	place.multi = multi;
// 	place.setdata(multi.mapdata);
// 	place.add();
// 	place.sethole(hole);
// 	window.requestAnimationFrame(frame);
// 	if (debug) { // Expose things to console
// 		window.render = render;
// 		window.camera = scene.camera;
// 		window.players = place.players;
// 		window.player = place.player;
// 		window.multi = place.multi;
// 		window.place = place;
// 		window.scene = scene;
// 		window.world = world;
// 		window.Settings = Settings;
// 		window.Multi = Multi;
// 		window.CANNON = CANNON;
// 		window.THREE = THREE;
// 	}
// });