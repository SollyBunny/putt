
import * as THREE from "../lib/three.js";
import * as CANNON from "../lib/cannon.js";
import Lazy from "../lib/lazy.js";

import CannonDebugRenderer from "../lib/cannon.dbg.js"; 
import Settings from "./settings.js";

export const scene = new THREE.Scene();
export const world = new CANNON.World();

export const can = document.getElementById("can");
export const render = new THREE.WebGLRenderer({ canvas: can });
export const camera = new THREE.PerspectiveCamera(Settings.FOV, can.width / can.height, 0.1, Settings.RENDERDISTANCE);

{ // Scene
	scene.background = new THREE.Color(0x222222);
	{
		const light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1)
		light.position.set(0, 100, 0);
		scene.add(light);
	}
}

scene.fogbottom = new Lazy(() => {
	const fogbottom = new THREE.Object3D();
	fogbottom.material = new THREE.MeshBasicMaterial({
		color: 0xFFFFFF,
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide
	});
	const geometry = new THREE.PlaneGeometry(1024, 1024);
	for (let i = 1; i < 10; ++i) {
		const slice = new THREE.Mesh(geometry, fogbottom.material);
		slice.position.y = -10 - i * 2;
		slice.rotation.x = Math.PI / -2;
		fogbottom.add(slice);
	}
	return fogbottom;
}, fogbottom => {
	scene.add(fogbottom);
	return fogbottom;
}, fogbottom => {
	scene.remove(fogbottom);
	return fogbottom;
});
scene.dust = new Lazy(() => {
	const particlesnum = 500;
	const particlespos = new Float32Array(particlesnum * 3);
	const particlesvel = new Float32Array(particlesnum * 3);
	for (let i = 0; i < particlesnum * 3; i += 3) {
		particlespos[i    ] = Math.random() * 100 - 50;
		particlespos[i + 1] = Math.random() * 50 - 10;
		particlespos[i + 2] = Math.random() * 100 - 50;
	}
	const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(particlespos, 3)), new THREE.PointsMaterial({
		color: 0xFFFFFF,
		size: 0.1,
		sizeAttenuation: true
	}));
	dust.num = particlesnum;
	dust.pos = particlespos;
	dust.vel = particlesvel;
	return dust;
}, dust => {
	scene.add(dust);
	return dust;
}, dust => {
	scene.remove(dust);
	return dust;
});

{ // World
	world.gravity.set(0, -1, 0) // m/s²
	world.solver.iterations = 30;
}

{ // Camera
	camera.rotation.order = "YXZ";
	camera.dir = [0, 0];
	camera.zoom = 20;
	camera.zoomtarget = 20;
	camera.shoot = undefined;
	camera.frustum = new THREE.Frustum();
	camera.target = new THREE.Vector3();
}

export function resize() {
	camera.aspect = can.clientWidth / can.clientHeight;
	camera.updateProjectionMatrix();
	render.setSize(can.clientWidth, can.clientHeight);
}
window.addEventListener("resize", resize);
resize();

let start = Date.now();
let tx, to = 0, tt;
export let fps = 0;
export let time = 0;
export function tick() {
	// Time
		tt = Date.now();
		tx = tt - to;
		fps = 1000 / tx;
		if (Settings.MAXFPS > 0 && fps > Settings.MAXFPS) return;
		to = tt;
		time = Date.now() - start;
	if (Settings.FOG) scene.fogbottom.get(); // TODO move this to a on settings
	else scene.fogbottom.unload();
	if (Settings.DUST) { // Dust
		const p = new THREE.Vector3();
		const dust = scene.dust.get();
		for (let i = 0; i < dust.pos.length; i += 3) {
			const n = Math.random();
			if (n < 0.1) {
				dust.vel[i + 1] += n - 0.05;
			} else if (n < 0.2) {
				dust.vel[i] += n - 0.1;
			} else if (n < 0.3) {
				dust.vel[i + 2] += n - 0.15;
			} else if (n < 0.6) {
				p.x = dust.pos[i    ];
				p.y = dust.pos[i + 1];
				p.z = dust.pos[i + 2];
				if (!camera.frustum.containsPoint(p)) {
					dust.pos[i    ] = camera.position.x + Math.random() * 100 - 50;
					dust.pos[i + 1] = camera.position.y + Math.random() * 50 - 25;
					dust.pos[i + 2] = camera.position.z + Math.random() * 100 - 50;
					dust.vel[i] = dust.vel[i + 1] = dust.vel[i + 2] = 0;
					continue;
				}
			}
			dust.pos[i    ] += dust.vel[i    ];
			dust.pos[i + 1] += dust.vel[i + 1];
			dust.pos[i + 2] += dust.vel[i + 2];
		}
		dust.geometry.attributes.position.needsUpdate = true;
	} else { scene.dust.unload(); }
	{ // Camera
		camera.zoom = (camera.zoomtarget + camera.zoom) / 2;
		camera.position.x = Math.sin( camera.dir[0] * Settings.SENSITIVITY) * Math.cos(camera.dir[1] * Settings.SENSITIVITY) * camera.zoom;
		camera.position.y = Math.sin(-camera.dir[1] * Settings.SENSITIVITY) * camera.zoom;
		camera.position.z = Math.cos( camera.dir[0] * Settings.SENSITIVITY) * Math.cos(camera.dir[1] * Settings.SENSITIVITY) * camera.zoom;
		if (keys["c"]) {
			camera.position.x *= 0.25;
			camera.position.y *= 0.25;
			camera.position.z *= 0.25;
		}
		camera.position.x += camera.target.x;
		camera.position.y += camera.target.y;
		camera.position.z += camera.target.z;
		camera.lookAt(camera.target.x, camera.target.y, camera.target.z);
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
	}
});

can.addEventListener("wheel", event => {
	camera.zoomtarget += event.deltaY / 10;
	if (camera.zoomtarget < 5)
		camera.zoomtarget = 5;
	else if (camera.zoomtarget > Settings.RENDERDISTANCE)
		camera.zoomtarget = Settings.RENDERDISTANCE;
}, { passive : true });

const dragStart = [0, 0];
function onPointermove(event) {
	camera.dir[0] = dragStart[0] - event.offsetX;
	camera.dir[1] = dragStart[1] - event.offsetY;
	if (camera.dir[1] > -0.1) {
		camera.dir[1] = -0.1;
		dragStart[1] = event.layerY + camera.dir[1];
	} else if (camera.dir[1] * Settings.SENSITIVITY < Math.PI / -2 + 0.1) {
		camera.dir[1] = (Math.PI / -2 + 0.1) / Settings.SENSITIVITY;
		dragStart[1] = event.layerY + camera.dir[1];
	}
}
function onPointerup(event) {
	can.removeEventListener("pointermove", onPointermove);
	can.removeEventListener("pointerup", onPointerup);
	can.removeEventListener("pointercancel", onPointerup);
	can.releasePointerCapture(event.pointerId);
}
can.addEventListener("pointerdown", event => {
	// TODO: check scene for collide and fire event
	can.setPointerCapture(event.pointerId);
	can.addEventListener("pointermove", onPointermove);
	can.addEventListener("pointerup", onPointerup);
	can.addEventListener("pointercancel", onPointerup);
	dragStart[0] = camera.dir[0] + event.offsetX;
	dragStart[1] = camera.dir[1] + event.offsetY;
});
