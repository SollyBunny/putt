
import * as THREE from "../lib/three.js";
import * as CANNON from "../lib/cannon.js";

import CannonDebugRenderer from "../lib/cannon.dbg.js"; 
import Settings from "./settings.js";

export const scene = new THREE.Scene();
export const world = new CANNON.World();

export const can = document.getElementById("can");
export const render = new THREE.WebGLRenderer({ canvas: can });
export const camera = new THREE.PerspectiveCamera(Settings.FOV, can.width / can.height, 0.1, Settings.RENDERDISTANCE);

{ // Scene
	scene.background = new THREE.Color(0x222222);
}

{ // Fog
	scene.fogbottom = new THREE.Object3D();
	scene.fogbottom.material = new THREE.MeshBasicMaterial({
		color: 0xFFFFFF,
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide
	});
	const geometry = new THREE.PlaneGeometry(1024, 1024);
	for (let i = 1; i < 10; ++i) {
		const slice = new THREE.Mesh(geometry, scene.fogbottom.material);
		slice.position.y = -10 - i * 2;
		slice.rotation.x = Math.PI / -2;
		scene.fogbottom.add(slice);
	}
	scene.add(scene.fogbottom);
}

if (Settings.DUST) { // Dust
	const particlesnum = 500;
	const particlespos = new Float32Array(particlesnum * 3);
	const particlesvel = new Float32Array(particlesnum * 3);
	for (let i = 0; i < particlesnum * 3; i += 3) {
		particlespos[i    ] = Math.random() * 100 - 50;
		particlespos[i + 1] = Math.random() * 50 - 10;
		particlespos[i + 2] = Math.random() * 100 - 50;
	}
	scene.dust = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(particlespos, 3)), new THREE.PointsMaterial({
		color: 0xFFFFFF,
		size: 0.1,
		sizeAttenuation: true
	}));
	scene.dust.num = particlesnum;
	scene.dust.pos = particlespos;
	scene.dust.vel = particlesvel;
	scene.add(scene.dust);
}

{ // World
	world.gravity.set(0, -1, 0) // m/s²
	world.solver.iterations = 30;
}

{ // Camera
	camera.rotation.order = "YXZ";
	camera.dir = [0, 0];
	camera.zoom = 20;
	camera.zoomtarget = 20;
	camera.start = undefined;
	camera.shoot = undefined;
	camera.frustum = new THREE.Frustum();
	camera.target = new THREE.Vector3();
}

export function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	render.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize);
resize();

let start = Date.now();
let tx, to = 0, tick = 0;
export let fps = 0;
export let time = 0;
export function tick(dx) {
	// Time
		tx = tt - to;
		fps = 1000 / tx;
		if (Settings.MAXFPS > 0 && fps > Settings.MAXFPS) {
			window.requestAnimationFrame(frame);
			return;
		}
		to = tt;
		place.tick = Date.now() - start;
	if (Settings.DUST) {
		const p = new THREE.Vector3();
		for (let i = 0; i < scene.dust.pos.length; i += 3) {
			const n = Math.random();
			if (n < 0.1) {
				scene.dust.vel[i + 1] += n - 0.05;
			} else if (n < 0.2) {
				scene.dust.vel[i] += n - 0.1;
			} else if (n < 0.3) {
				scene.dust.vel[i + 2] += n - 0.15;
			} else if (n < 0.6) {
				p.x = scene.dust.pos[i    ];
				p.y = scene.dust.pos[i + 1];
				p.z = scene.dust.pos[i + 2];
				if (!camera.frustum.containsPoint(p)) {
					scene.dust.pos[i    ] = camera.position.x + Math.random() * 100 - 50;
					scene.dust.pos[i + 1] = camera.position.y + Math.random() * 50 - 25;
					scene.dust.pos[i + 2] = camera.position.z + Math.random() * 100 - 50;
					scene.dust.vel[i] = scene.dust.vel[i + 1] = scene.dust.vel[i + 2] = 0;
					continue;
				}
			}
			scene.dust.pos[i    ] += scene.dust.vel[i    ];
			scene.dust.pos[i + 1] += scene.dust.vel[i + 1];
			scene.dust.pos[i + 2] += scene.dust.vel[i + 2];
		}
		scene.dust.geometry.attributes.position.needsUpdate = true;
	}
	render.render(scene, camera);
}

export let keys = {}; // Key Pair : Key Pressed
window.addEventListener("blur", event => {
	keys = {};
});
window.addEventListener("onkeydown", event => { 
	keys[event.key.toLowerCase()] = true;
});
window.addEventListener("onkeyup", event => {
	const k = event.key.toLowerCase();
	keys[k] = false;
	if (k === "escape") {
		window.top.postMessage(["GAME"], "*");
	} else if (k === "m") {
		if (debugmeshenabled === false) {
			if (!debugmesh) {
				debugmesh = new CannonDebugRenderer(scene, world);
				debugmesh.material.color.set(0xFF0000);
				debugmesh.material.wireframeLinewidth = 15;
				debugmesh.material.linewidth = 15;
			}
			debugmesh.add();
			e_debug.style.display = "contents";
			debugmeshenabled = true;
		} else {
			debugmesh.remove();
			e_debug.style.display = "none";
			debugmeshenabled = false;
		}
		event.preventDefault(); // Prevent dev console stuff
	} else if (k === "k") {
		scene.confetti.spawn(
			player.body.position.x,
			player.body.position.y + 1,
			player.body.position.z
		);
	} else if (k === "f") {
		fpsenabled = !fpsenabled;
	} else if (k === "r") {
		place.player.die();
	}
});

can.addEventListener("wheel", event => {
	camera.zoomtarget += event.deltaY / 10;
	if (camera.zoomtarget < 5)
		camera.zoomtarget = 5;
	else if (camera.zoomtarget > Settings.RENDERDISTANCE / 2)
		camera.zoomtarget = Settings.RENDERDISTANCE / 2;
}, { passive : true });
