import * as THREE from "../lib/three.module.min.js";
import * as CANNON from "../lib/cannon.min.js";
import Settings from "./settings.js";
import Effect from "./effect.js";
import spawnbowlingtext from "./bowling.js"
import { ConvexGeometry, mergeVertices, RoundedBoxGeometry } from "../lib/three.ext.js";
import { Types, Modifiers, Physics, Powerups, Rainbow } from "./def.js";

const e_rtext     = document.getElementById("rtext"); // To use as a canvas for player names
const e_rmapname  = document.getElementById("rmapname"); // Store mapname
const e_rscore    = document.getElementById("rscore"); // Stores player scorecard
const e_cpowerups = document.getElementById("powerupcontainer").children;

export class Place {
	// Can't call it map because of JS reserving so many names
	materials = {
		FLOOR1:  new THREE.MeshPhongMaterial({ flatShading: true }), // Used for flat floor
		FLOOR2:  new THREE.MeshPhongMaterial({ flatShading: true }), // Used for bumpy / special floor
		WALL:    new THREE.MeshLambertMaterial({ transparent: true }), // Used for wall
		OBJ:     new THREE.MeshLambertMaterial(), // Used for obstacles
		BOUNCE:  new THREE.MeshLambertMaterial(), // Used for bouncer, booster
		HOLE:    new THREE.MeshLambertMaterial({ side: THREE.BackSide }), // Used for hole
		START:   new THREE.MeshLambertMaterial({ side: THREE.BackSide, transparent: true, opacity: 0.8 }), // Used for start
		POWERUP: new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.7, side: THREE.DoubleSide }), // Used for powerups
	}
	constructor(scene, world) {
		this.scene = scene;
		this.world = world;
		this.players = [];
		this.del();
	}
	setdata(data) {
		this.data = data;
		// Set colors
			this.materials.FLOOR1.color.setHex(data[1][1]); // Used for floor
			this.materials.FLOOR2.color.r = this.materials.FLOOR1.color.r * 0.5;
			this.materials.FLOOR2.color.g = this.materials.FLOOR1.color.g * 0.5;
			this.materials.FLOOR2.color.b = this.materials.FLOOR1.color.b * 0.5;
			this.materials.WALL.color.setHex(data[1][2]); // Used for wall
			this.materials.OBJ.color.setHex(data[1][3]); // Used for obstacles
			this.materials.BOUNCE.color.setHex(data[1][3]); // Used for bouncer, booster
			this.materials.HOLE.color.setHex(data[1][2]); // Used for hole
		// Set maps 
			/*new THREE.TextureLoader().load(
				"assets/floor.png",
				texture => {
					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.RepeatWrapping;
					texture.offset.set( 0, 0 );
					texture.repeat.set(10, 10);
					this.materials.FLOOR1.map = this.materials.FLOOR2.map = texture;
					this.materials.FLOOR1.needsUpdate = this.materials.FLOOR2.needsUpdate = true;
				},
				e => {
					console.warn("Failed to load assets/floor.png", e);
				}
			);*/
		// Generate Map stuff
			let m, j;
			for (let i = 2; i < data.length; ++i) {
				m = data[i];
				switch (m[0]) {
					case Types.FLOOR      : j = new Floor      (this, m[1]); break;
					case Types.BUMPYFLOOR : j = new Bumpyfloor (this, m[1]); break;
					case Types.WALL       : j = new Wall       (this, m[1]); break;
					case Types.START      : j = new Start      (this, m[1]); break;
					case Types.HOLE       : j = new Hole       (this, m[1]); break;
					case Types.BOOSTER    : j = new Booster    (this, m[1]); break;
					case Types.BUMPER     : j = new Bumper     (this, m[1]); break;
					case Types.ISPINNER   : j = new Ispinner   (this, m[1]); break;
					case Types.TSPINNER   : j = new Tspinner   (this, m[1]); break;
					case Types.XSPINNER   : j = new Xspinner   (this, m[1]); break;
					case Types.SQUARE     : j = new Square     (this, m[1]); break;
					case Types.TRIANGLE   : j = new Triangle   (this, m[1]); break;
					case Types.TEXT       : j = new Text       (this, m[1]); break;
					case Types.POWERUP    : j = new Powerup    (this, m[1]); break;
					case Types.PLATFORM   : j = new Platform   (this, m[1]); break;
					default: continue;
				}
				if (m[2]) {
					for (let k = 0; k < m[2].length; ++k) {
						switch (m[2][k][0]) {
							case Modifiers.TEXT:
								if (!j.mesh) break;
								j.textset(m[2][k][1]);
								this.mods.text.push(j);
								break;
							case Modifiers.SCALE:
								if (!j.mesh) break;
								j.mesh.geometry.scale.x = m[2][k][1][0];
								j.mesh.geometry.scale.y = m[2][k][1][1];
								j.mesh.geometry.scale.z = m[2][k][1][2];
								break;
							case Modifiers.MOVE:
								break;
							case Modifiers.EASEMOVE:
								break;
							case Modifiers.SPIN:
								j.modspin = m[2][k][1];
								this.mods.spin.push(j);
								break;
							case Modifiers.BOUNCE:
								j.body.modbounce = m[2][k][1];
								j.body.addEventListener("collide", j.bounce);
								break;
							case Modifiers.VELOCITY:
								j.body.modvelocitycontacts = [];  // This is a queue
								j.body.modvelocity = m[2][k][1];
								console.log("Added vel for", i)
								j.body.addEventListener("collide", j.velocity);
								break;
						}
					}
				}
				this.things.push(j);
			}
	}
	sethole(id) {
		if (id > this.holes.length - 1) return;
		this.players.forEach(i => {
			i.sethole(id);
		})
	}
	addplayer(name, color, me) {
		const player = new Player(this, name, color);
		if (me) {
			this.player = player;
			this.scene.camera.follow = player;
		}
		console.log(this, this.players)
		this.players.push(player);
		return player;
	}
	add() {
		e_rscore.style.gridTemplateColumns = `3fr repeat(${this.holes.length}, 1fr) 1fr`;
		this.things.forEach(i => { i.add(); });
		this.players.forEach(i => { i.add(); });
		e_rmapname.textContent = this.data[0][0];
		this.scene.background.setHex(this.data[1][0]);
		if (Settings.FOG) {
			this.scene.fogmaterial.color.setHex(this.data[1][0]);
			this.scene.fogmaterial.color.addScalar(0.1);
		}
	}
	del() {
		if (this.things)
			this.things.forEach(i => { i.del(); });
		this.mods = {};
		this.mods.text     = [];
		this.mods.move     = [];
		this.mods.easemove = [];
		this.mods.spin     = [];
		this.starts   = [];
		this.holes    = [];
		this.powerups = [];
		this.walls    = [];
		this.things   = [];
		this.tick = 0;
	}
}

let GUID = 0;
export class Thing {
	constructor(parent, type, mesh, body, text) {
		this.parent = parent;
		this.type = type;
		this.mesh = mesh;
		this.body = body;
		if (text) this.textset(text);
		this.GUID = GUID;
		++GUID;
	}
	textset(text) {
		if (!this.text) this.text = document.createElement("div");
		this.text.textContent = text;
	}
	add() {
		if (this.mesh)
			this.parent.scene.add(this.mesh);
		if (this.body) {
			this.body.parent = this;
			this.parent.world.addBody(this.body);
			if (this.oncollide)
				this.body.addEventListener("collide", this.oncollide);
		}
		if (this.text)
			e_rtext.appendChild(this.text);
	}
	del() {
		if (this.mesh)
			this.parent.scene.remove(this.mesh);
		if (this.body)
			this.parent.world.removeBody(this.body);
		if (this.text)
			this.text.remove();
	}
	bounce(e) {
		let d = Math.atan2(
			e.body.position.x - e.target.position.x,
			e.body.position.z - e.target.position.z,
		);
		e.body.velocity.x = Math.sin(d) * e.target.modbounce;
		e.body.velocity.z = Math.cos(d) * e.target.modbounce;
	}
	velocity(e) {
		const now = Date.now();
		if (now - e.body.lastvelocitycollide < 1000) return;
		e.body.lastvelocitycollide = now;
		if (e.body.velocity.y < 1) e.body.velocity.y = 0;
		console.log("Collide", e.target.modvelocity)
		e.body.velocity.x += e.target.modvelocity[0];
		e.body.velocity.y += e.target.modvelocity[1];
		e.body.velocity.z += e.target.modvelocity[2];
	}
}

export class Player extends Thing {
	radius   = 0.3;
	mass     = 0.3;
	geometry = new THREE.IcosahedronGeometry(0.3, Settings.HIPOLYBALL ? 5 : 2);
	shape    = new CANNON.Sphere(0.3);
	physics  = new CANNON.Material({
		restitution: 1,
		friction: 1,
	});
	constructor(parent, name, color) {
		super(parent, Types.PLAYER, undefined, undefined, name);
		this.stroke = [];
		this.total  = 0;
		this.hole   = 0;
		this.name   = name;
		this.color  = new THREE.Color(color);
		/*if (Settings.LIGHTING) {
			this.light = new THREE.PointLight(this.color, 1);
			this.light.decay = 2;
			this.light.distance = 50;
		}*/
		this.mesh = new THREE.Mesh(
			this.geometry,
			new THREE.MeshLambertMaterial({
				color: this.color,
				flatShading: true,
				transparent: true,
			})
		);
		this.mesh.renderOrder = 10000;
		this.body = new CANNON.Body({
			mass: this.mass,
			shape: this.shape,
			material: this.physics
		});
		this.body.position.y = 2;
		this.isshoot = true;
		this.ishole  = false;
		this.lastsafe = new CANNON.Vec3();
		this.textset(name);
		this.parent.mods.text.push(this);
		this.powerups = [];
		this.inflatetimeouts = []; // This is a queue
		this.e_name = document.createElement("div");
		this.e_name.textContent = this.name;
		this.e_name.className = "name";
		this.e_rtotal = document.createElement("div");
		this.e_rtotal.innerHTML = "0";
		this.e_rtotal.className = "total";
		this.e_cscore = [];
	}
	add() {
		Thing.prototype.add.call(this);
		e_rscore.appendChild(this.e_name);
		for (let i = 0; i < this.parent.holes.length; ++i) {
			this.e_cscore[i] = document.createElement("div");
			this.e_cscore[i].innerHTML = this.stroke[i] || 0;
			this.e_cscore[i].classList.add("hole" + i);
			if (this.hole === i) this.e_cscore[i].classList.add("holesel");
			e_rscore.appendChild(this.e_cscore[i]);
		}
		e_rscore.appendChild(this.e_rtotal);
	}
	del() {
		Thing.prototype.del.call(this);
		e_rscore.removeChild(this.e_name);
		this.e_cscore.forEach(i => {
			e_rscore.removeChild(i);
		});
		e_rscore.removeChild(this.e_rtotal);
	}
	die() {
		this.isshoot = false;
		this.ishole = false;
		this.mesh.material.opacity = 1;
		this.body.force.setZero();
		this.body.inertia.setZero();
		this.body.position.x = this.lastsafe.x;
		this.body.position.y = this.lastsafe.y;
		this.body.position.z = this.lastsafe.z;
		this.body.angularVelocity.x = this.body.angularVelocity.y = this.body.angularVelocity.z = this.body.velocity.x = this.body.velocity.y = this.body.velocity.z = 0;
		this.body.shapes[0].radius = this.radius;
		this.body.mass = this.mass;
		this.body.updateInertiaWorld();
		this.mesh.scale.setScalar(1);
		this.inflatetimeouts.forEach(window.clearTimeout);
		this.inflatetimeouts = [];
	}
	inflateanimaton(amount, n) {
		this.mesh.scale.addScalar(amount);
		if ((n--) > 0)
			window.setTimeout(this.inflateanimaton.bind(this, amount, n - 1), 10);
	}
	inflate(amount) {
		this.body.shapes[0].radius *= amount;
		this.inflateanimaton(amount / 100, 100);
		this.inflatetimeouts.push(
			window.setTimeout(this.deflate.bind(this, amount), 10000)
		);
	}
	deflate(amount) {
		this.body.shapes[0].radius /= amount;
		this.inflateanimaton(amount / -100, 100);
		this.inflatetimeouts.pop();
	}
	sethole(hole) {
		if (this.hole !== hole) {
			if (this.e_cscore[this.hole]) this.e_cscore[this.hole].classList.remove("holesel");
			this.hole = hole;
			if (this.e_cscore[this.hole]) this.e_cscore[this.hole].classList.add("holesel");
		}
		if (this.parent.player === this) {
			const dx = this.parent.holes[hole].body.position.x - this.parent.starts[hole].mesh.position.x;
			const dz = this.parent.holes[hole].body.position.z - this.parent.starts[hole].mesh.position.z;
			this.parent.scene.camera.dir[0] = (Math.atan2(dx, dz) + Math.PI) / Settings.SENSITIVITY;
			this.parent.scene.camera.dir[1] = -90;
		}
		this.lastsafe.x = this.parent.starts[hole].mesh.position.x;
		this.lastsafe.y = this.parent.starts[hole].mesh.position.y + 2;
		this.lastsafe.z = this.parent.starts[hole].mesh.position.z;
		this.die();
	}
	onhole() {
		this.lastsafe.x = this.parent.holes[this.hole].body.position.x;
		this.lastsafe.y = this.parent.holes[this.hole].body.position.y - 1;
		this.lastsafe.z = this.parent.holes[this.hole].body.position.z;
		this.die();
		this.ishole = true;
		this.body.mass = 0;
		this.mesh.material.opacity = 0.5;
		this.parent.scene.confetti.spawn(
			this.parent.holes[this.hole].body.position.x,
			this.parent.holes[this.hole].body.position.y + 1,
			this.parent.holes[this.hole].body.position.z
		);
		if (this.id === this.parent.player.id) {
			Effect(Effect.YAY);
			console.log(this)
			if (this.stroke[this.hole] === undefined) {
				spawnbowlingtext("🕴", "Hole in None", `Made by ${this.name}`);
			} else if (this.stroke[this.hole] < 2) {
				spawnbowlingtext("🏆", "Hole in One", `Made by ${this.name}`);
			} else {
				spawnbowlingtext("🏌️", `Hole in ${this.stroke[this.hole]}`, `Made by ${this.name}`);
			}
			this.parent.multi.hole(this.hole);
		}
	}
	onhit() {
		this.total += 1;
		this.e_rtotal.innerHTML = this.total;
		if (this.stroke[this.hole] === undefined)
			this.stroke[this.hole] = 1;
		else
			this.stroke[this.hole] += 1;
		this.e_cscore[this.hole].innerHTML = this.stroke[this.hole];
		Effect(Effect.HIT);
	}
	onpowerup(id) {
		let index;
		if      (this.powerups[2] === undefined) index = 2;
		else if (this.powerups[1] === undefined) index = 1;
		else if (this.powerups[0] === undefined) index = 0;
		else return;
		console.log(`${this.id} got powerup ${id}`);
		this.powerups[index] = id;
		if (this.id === this.parent.player.id) {
			e_cpowerups[index].onclick = this.onpowerupuse.bind(this, index);
			e_cpowerups[index].disabled = false;
			e_cpowerups[index].title = `${Powerups[id][0]} - ${Powerups[id][1]}`;
			e_cpowerups[index].style.background = Powerups[id][2];
			e_cpowerups[index].innerHTML = Powerups[id][3];
		}
	}
	onpowerupuse(index) {
		const powerup = this.powerups[index];
		delete this.powerups[index];
		if (this.id === this.parent.player.id) {
			e_cpowerups[index].onclick = null;
			e_cpowerups[index].disabled = true;
			e_cpowerups[index].title = "";
			e_cpowerups[index].style.background = "inherit";
			e_cpowerups[index].innerHTML = "";
			if (powerup === 0) {
				this.parent.multi.powerup(undefined);
				this.parent.multi.powerup(undefined);
				this.parent.multi.powerup(undefined);
			}
			this.parent.multi.powerupuse(index);
		}
		switch (powerup) {
			case 0: // Powerup Box
				break;
			case 1: // Teleport
				break;
			case 2: // Sticky Walls
				if (this.parent.timeoutsticky) {
					window.clearTimeout(this.parent.timeoutsticky);
				} else {
					this.parent.materials.WALL.color.r *= 2;
					this.parent.materials.WALL.color.g *= 2;
					this.parent.materials.WALL.color.b /= 4;
					Physics.WALL.restitution = 0;
				}
				this.parent.timeoutsticky = window.setTimeout(() => {
					delete this.parent.timeoutsticky;
					this.parent.materials.WALL.color.r /= 2;
					this.parent.materials.WALL.color.g /= 2;
					this.parent.materials.WALL.color.b *= 4;
					Physics.WALL.restitution = 1;
				}, 10000);
				break;
			case 3: // Icy Floors
				if (this.parent.timeouticy) {
					window.clearTimeout(this.parent.timeouticy);
				} else {
					this.parent.materials.FLOOR1.color.r /= 2;
					this.parent.materials.FLOOR1.color.g *= 8;
					this.parent.materials.FLOOR1.color.b *= 8;
					this.parent.materials.FLOOR2.color.r /= 2;
					this.parent.materials.FLOOR2.color.g *= 8;
					this.parent.materials.FLOOR2.color.b *= 8;
					Physics.FLOOR.friction = 0;
				}
				this.parent.timeouticy = window.setTimeout(() => {
					delete this.parent.timeouticy;
					this.parent.materials.FLOOR1.color.r *= 2;
					this.parent.materials.FLOOR1.color.g /= 8;
					this.parent.materials.FLOOR1.color.b /= 8;
					this.parent.materials.FLOOR2.color.r *= 2;
					this.parent.materials.FLOOR2.color.g /= 8;
					this.parent.materials.FLOOR2.color.b /= 8;
					Physics.FLOOR.friction = 1;
				}, 10000);
				break;
			case 4: // Big Balls
				Effect(Effect.INFLATE);
				this.parent.players.forEach(i => {
					i.inflate(3);
				});
				break;
			case 5: // No Walls
				this.parent.materials.WALL.opacity = 0.2;
				this.parent.materials.WALL.depthWrite = false; // Allow ball to appear inside wall
				this.parent.walls.forEach(i => {
					i.body.isTrigger = true;
				});
				window.setTimeout(() => {
					this.parent.materials.WALL.opacity = 1;
					this.parent.materials.WALL.depthWrite = true;
					this.parent.walls.forEach(i => {
						i.body.isTrigger = false;
					});
				}, 10000);
				break;
			case 6: // No Obstacles
				break;
			case 7: // Reverse Shot
				break;
			case 8: // Insane Shot
				break;
			case 9: // Bumper
				break;
			case 10: // Steal
				break;
			case 11: // Swap
				break;
			case 12: // Cube
				break;
		}
	}
	oncollide(e) {
		if (e.body.parent.type === Types.POWERUP) {
			if (e.target.parent.id === e.target.parent.parent.player.id) {
				if (e.body.parent.got) return;
				Effect(Effect.YAY);
				e.target.parent.parent.multi.powerup(e.body.parent.id);
			} else {
				e.body.parent.onget();
			}
		} else if (e.target.parent.isshoot === false) {
			Effect(Effect.BOUNCE);
		}
	}
	onupdate(tx) {
		/*if (this.light) {
			this.light.position.x = this.body.position.x;
			this.light.position.y = this.body.position.y + 1;
			this.light.position.z = this.body.position.z;
		}*/
		this.mesh.position.x   = this.body.position.x;
		this.mesh.position.y   = this.body.position.y;
		this.mesh.position.z   = this.body.position.z;
		if (this.ishole) return;
		if (this.body.position.y < -15) {
			this.die();
			return;
		}
		this.mesh.quaternion.x = this.body.quaternion.x;
		this.mesh.quaternion.y = this.body.quaternion.z;
		this.mesh.quaternion.z = this.body.quaternion.y;
		this.mesh.quaternion.w = this.body.quaternion.w;
		if (
			Math.sqrt(
				this.body.velocity.x ** 2 +
				this.body.velocity.y ** 2
			) < 0.5 &&
			Math.abs(this.body.velocity.z) < 0.1
		) {
			this.body.angularVelocity.x = this.body.angularVelocity.y = this.body.angularVelocity.z = this.body.velocity.x = this.body.velocity.z = 0;
			this.isshoot = true;
		} else {
			this.isshoot = false;
			this.body.velocity.x *= 0.99 ** (tx / 15);
			this.body.velocity.z *= 0.99 ** (tx / 15);

		}
	}
}

export class Start extends Thing {
	light = new THREE.PointLight(0xFFFFFF, 0.2, 100, 5, 0.5);
	constructor(parent, pos) {
		super(parent, Types.START);
		// Set id
		this.id = this.parent.starts.length;
		this.parent.starts.push(this);
		this.material = this.parent.materials.START.clone();
		this.material.color = Rainbow[this.id];
		this.mesh = new THREE.Mesh(
			new THREE.CircleGeometry(0.5, 20),
			this.material
		);
		this.mesh.rotation.x = Math.PI / 2;
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.01;
		this.mesh.position.z = pos[2];
		if (Settings.LIGHTING) {
			const light = this.light.clone();
			light.position.set(pos[0], pos[1] + 1, pos[1]);
			light.color = Rainbow[this.id];
			this.mesh.add(light);
		}
	}
}

export class Hole extends Thing {
	shape = new CANNON.ConvexPolyhedron({
		vertices: [
	        new CANNON.Vec3(-0.7, -1.6, -0.7),
	        new CANNON.Vec3( 0.7, -1.6, -0.7),
	        new CANNON.Vec3( 0.7, -0.2, -0.7),
	        new CANNON.Vec3(-0.7, -0.2, -0.7),
	        new CANNON.Vec3(-0.7, -1.6,  0.7),
	        new CANNON.Vec3( 0.7, -1.6,  0.7),
	        new CANNON.Vec3( 0.7, -0.2,  0.7),
	        new CANNON.Vec3(-0.7, -0.2,  0.7),
	    ],
		faces: [
		    [0, 1, 2, 3], // -z b
            [3, 2, 1, 0], // -z f
            [7, 6, 5, 4], // +z b
            [4, 5, 6, 7], // +z f
            [0, 4, 7, 3], // -x b
            [3, 7, 4, 0], // -x f
            [1, 2, 6, 5], // +x b
            [5, 6, 2, 1], // +x f
            [1, 0, 4, 5], // +y b
            [5, 4, 0, 1], // +y f
       ]
    });
    light = new THREE.PointLight(0xFFFFFF, 0.2);
    geometrybottom = new THREE.ShapeGeometry(new THREE.Shape([
    	new THREE.Vector2( 1,  1),
    	new THREE.Vector2(-1,  1),
    	new THREE.Vector2(-1, -1),
    	new THREE.Vector2( 1, -1),
    ])).rotateX(Math.PI / 2);
    geometrycylinder = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 20, 1, true);
	constructor(parent, pos) {
		super(parent, Types.HOLE);
		// Set id
		this.id = this.parent.holes.length;
		this.parent.holes.push(this);
		this.mesh = new THREE.Object3D();
		this.material = this.parent.materials.HOLE.clone();
		this.material.color = Rainbow[this.id];
		let mesh;
		{ // cylinder bottom
			mesh = new THREE.Mesh(this.geometrybottom, this.material); 
			mesh.position.x = pos[0];
			mesh.position.y = pos[1] - 1.6;
			mesh.position.z = pos[2];
			this.mesh.add(mesh);
		}
		{ // open cylinder
			mesh = new THREE.Mesh(this.geometrycylinder, this.material);
			mesh.position.x = pos[0];
			mesh.position.y = pos[1] - 0.8;
			mesh.position.z = pos[2];
			this.mesh.add(mesh);
		}
		if (Settings.LIGHTING) {
			const light = this.light.clone();
			light.position.set(pos[0], pos[1] + 5, pos[1]);
			light.color = Rainbow[this.id];
			this.mesh.add(light);
		}
    	this.body = new CANNON.Body({
			mass: 0,
			shape: this.shape,
			position: new CANNON.Vec3(pos[0], pos[1], pos[2]),
		});
	}
	oncollide(e) {
		if (e.body.ishole) return;
		if (e.body.parent.hole !== e.target.parent.id) {
			e.body.parent.sethole(e.body.parent.hole);
			return;
		};
		e.body.parent.onhole();
	}
}

export class Bumper extends Thing {
	geometry = new THREE.TorusGeometry(0.8, 0.5, 20, 20).rotateX(Math.PI / 2);
	shape = new CANNON.Sphere(1.2);
	constructor(parent, pos) {
		super(parent, Types.BOUNCER);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.BOUNCE);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
	}
}

export class Floor extends Thing {
	constructor(parent, pos) {
		super(parent, Types.FLOOR);
		let points = [];
		this.flat = undefined;
		for (let i = 0; i < pos.length; ++i) {
			if (this.flat === undefined)
				this.flat = pos[i][1];
			else if (this.flat !== false && this.flat !== pos[i][1])
				this.flat = false;
			points.push(new THREE.Vector3(pos[i][0], pos[i][1], pos[i][2]));
			points.push(new THREE.Vector3(pos[i][0], -100, pos[i][2]));
		}
		if (this.flat !== false) this.flat = true;
		this.geometry = new ConvexGeometry(points);
		this.geometry.computeBoundingBox();
		let x = undefined, z; // x used as flag
		for (let i = 2; i < parent.data.length; ++i) {
			if (
				parent.data[i][0] !== Types.HOLE ||
				parent.data[i][1][1] !== pos[0][1] ||
				this.geometry.boundingBox.min.x > parent.data[i][1][0] ||
				this.geometry.boundingBox.max.x < parent.data[i][1][0] ||
				this.geometry.boundingBox.min.z > parent.data[i][1][2] ||
				this.geometry.boundingBox.max.z < parent.data[i][1][2]
			) continue;
			x = parent.data[i][1][0];
			z = parent.data[i][1][2];
			break;
		}
		let faces = [];
		let center;
		if (x === undefined) {
			center = [
				(this.geometry.boundingBox.min.x + this.geometry.boundingBox.max.x) / 2,
				(this.geometry.boundingBox.min.y + this.geometry.boundingBox.max.y) / 2,
				(this.geometry.boundingBox.min.z + this.geometry.boundingBox.max.z) / 2
			];
			this.geometry = mergeVertices(this.geometry, 0);
			faces = []; // Generate faces for physics
			for (let i = 0; i < this.geometry.index.array.length; i += 3) {
				faces.push([
					this.geometry.index.array[i],
					this.geometry.index.array[i + 1],
					this.geometry.index.array[i + 2]
				]);
			}
		} else { // there is a hole
			center = [
				x,
				pos[0][1],
				z
			];
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
					this.geometry.attributes.position.array[i * 3 + 1] -= 120.5; // Reset position of circle point
					points.push(i);
				}
			}
			// Filter out faces made of circle points (to create hole)
			let newpoints = []; // generate points for new mesh at same time
			for (let i = 0; i < this.geometry.index.array.length; i += 3) {
				if (
					points.indexOf(this.geometry.index.array[i]) !== -1 &&
					points.indexOf(this.geometry.index.array[i + 1]) !== -1 &&
					points.indexOf(this.geometry.index.array[i + 2]) !== -1
				) continue; // these faces are inside the hole, so ignore them
				newpoints.push(this.geometry.index.array[i]);
				newpoints.push(this.geometry.index.array[i + 1]);
				newpoints.push(this.geometry.index.array[i + 2]);
				faces.push([
					this.geometry.index.array[i],
					this.geometry.index.array[i + 1],
					this.geometry.index.array[i + 2],
				]);
			}
			this.geometry.index.array = new Uint16Array(newpoints); // set new points in mesh
			this.geometry.index.count = newpoints.length; // set new length
			this.geometry.computeVertexNormals(); // TODO only calculate normals you must, this adds 0.5s to loading
		}
		points = []; // Format geometry points to CANNON.Vec3 for physics
		for (let i = 0; i < this.geometry.attributes.position.array.length; i += 3) {
			this.geometry.attributes.position.array[i] -= center[0];
			this.geometry.attributes.position.array[i + 1] -= center[1];
			this.geometry.attributes.position.array[i + 2] -= center[2];
			points.push(new CANNON.Vec3(
				this.geometry.attributes.position.array[i],
				this.geometry.attributes.position.array[i + 1],
				this.geometry.attributes.position.array[i + 2],
			));
		}
		this.mesh = new THREE.Mesh(this.geometry, this.flat ? this.parent.materials.FLOOR1 : this.parent.materials.FLOOR2);
		this.mesh.position.x = center[0];
		this.mesh.position.y = center[1];
		this.mesh.position.z = center[2];
		this.body = new CANNON.Body({
			mass: 0,
			shape: new CANNON.ConvexPolyhedron({
				vertices: points,
				faces: faces
			}),
			material: Physics.FLOOR
		});
		this.body.position.x = center[0];
		this.body.position.y = center[1];
		this.body.position.z = center[2];
	}
}

export class Bumpyfloor extends Thing {
	material = new THREE.MeshPhongMaterial({
		vertexColors: true,
		flatShading: true
	});
	constructor(parent, pos) {
		super(parent, Types.BUMPYFLOOR);
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
			else if (pos[i][2] > bounding[3])
				bounding[3] = pos[i][2];
		}
		let temp;
		if (bounding[0] > bounding[2]) {
			temp = bounding[0];
			bounding[0] = bounding[2];
			bounding[2] = temp;
		}
		if (bounding[1] > bounding[3]) {
			temp = bounding[1];
			bounding[1] = bounding[3];
			bounding[3] = temp;
		}
		const width  = bounding[2] - bounding[0];
		const height = bounding[3] - bounding[1];
		if (width === 0 || height === 0) {
			console.log(pos)
		}
		this.geometry = new THREE.PlaneGeometry(width, height, width, height);
		const vertices = this.geometry.attributes.position.array;
		const colors = new Float32Array(vertices.length * 3);
		for (let i = 0; i < vertices.length; i += 3) {
			if ((
				(i / 3) + (
					Math.floor(
						i / 3 / height
					) * (
						height % 2 == 0 ? 1 : 2
					)
				)
			) % 2 === 0) {
				colors[i    ] = this.parent.materials.FLOOR1.color.r;
				colors[i + 1] = this.parent.materials.FLOOR1.color.g;
				colors[i + 2] = this.parent.materials.FLOOR1.color.b;
			} else {
				colors[i    ] = this.parent.materials.FLOOR2.color.r;
				colors[i + 1] = this.parent.materials.FLOOR2.color.g;
				colors[i + 2] = this.parent.materials.FLOOR2.color.b;
				const x = vertices[i];
				const z = vertices[i + 1];
				if (Math.abs(x) * 2 !== width && Math.abs(z) * 2 !== height)
					vertices[i + 2] = 0.2;
			}
		}
		this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
		this.geometry.computeVertexNormals();
		let faces = []; // Generate faces for physics
		for (let i = 0; i < this.geometry.index.array.length; i += 3) {
			faces.push([
				this.geometry.index.array[i],
				this.geometry.index.array[i + 1],
				this.geometry.index.array[i + 2],
			]);
		}
		let points = []; // Format geometry points to CANNON.Vec3 for physics
		for (let i = 0; i < this.geometry.attributes.position.array.length; i += 3) {
			points.push(new CANNON.Vec3(
				this.geometry.attributes.position.array[i],
				this.geometry.attributes.position.array[i + 1],
				this.geometry.attributes.position.array[i + 2],
			));
		}
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.body = new CANNON.Body({
			mass: 0,
			shape: new CANNON.ConvexPolyhedron({
				vertices: points,
				faces: faces
			}),
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

export class Wall extends Thing {
	constructor(parent, pos) {
		super(parent, Types.WALL);
		this.parent.walls.push(this);
		this.mesh = new THREE.Object3D();
		this.body = new CANNON.Body({
			mass: 0,
			material: Physics.WALL
		});
		let mesh, geometry;
		for (let i = 1; i < pos.length; ++i) {
			geometry = new THREE.BoxGeometry(
				0.5, 100,
				Math.sqrt(
					(pos[i][0] - pos[i - 1][0]) ** 2 +
					(pos[i][2] - pos[i - 1][2]) ** 2
				) + 0.25
			);
			for (let m = 0; m < geometry.attributes.position.array.length; m += 3) {
				if (geometry.attributes.position.array[m + 1] === -30) continue;
				if (geometry.attributes.position.array[m + 2] > 0)
					geometry.attributes.position.array[m + 1] += pos[i][1];
				else
					geometry.attributes.position.array[m + 1] += pos[i - 1][1];
			}
			mesh = new THREE.Mesh(geometry, this.parent.materials.WALL);
			mesh.position.x = pos[i][0];
			mesh.position.z = pos[i][2]
			mesh.rotation.y = Math.atan2(
				pos[i][0] - pos[i - 1][0],
				pos[i][2] - pos[i - 1][2],
			);
			mesh.position.x -= geometry.parameters.depth * Math.sin(mesh.rotation.y) / 2
			mesh.position.z -= geometry.parameters.depth * Math.cos(mesh.rotation.y) / 2
			mesh.position.y -= 49;
			this.mesh.add(mesh);
			let faces = [];
			for (let m = 0; m < geometry.index.array.length; m += 3) {
				faces.push([
					geometry.index.array[m],
					geometry.index.array[m + 1],
					geometry.index.array[m + 2],					
				])
			}
			let points = [];
			for (let m = 0; m < geometry.attributes.position.array.length; m += 3) {
				points.push(new CANNON.Vec3(
					geometry.attributes.position.array[m],
					geometry.attributes.position.array[m + 1],
					geometry.attributes.position.array[m + 2],
				));
			}
			this.body.addShape(
				new CANNON.ConvexPolyhedron({
					vertices: points,
					faces: faces
				}),
				new CANNON.Vec3(
					mesh.position.x,
					mesh.position.y,
					mesh.position.z
				),
				new CANNON.Quaternion(
					mesh.quaternion.x,
					mesh.quaternion.y,
					mesh.quaternion.z,
					mesh.quaternion.w
				)
			);
		}
	}
}

export class Booster extends Thing {
	geometry = new THREE.BoxGeometry(2, 0.1, 2);
	shape = new CANNON.Box(new CANNON.Vec3(1, 0.1, 1));
	constructor(parent, pos) {
		super(parent, Types.BOOSTER);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.BOUNCE);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.1;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1], pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
	}
}

export class Square extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.8, -0.8),
			new THREE.Vector2( 0.8, -0.8),
			new THREE.Vector2( 0.8,  0.8),
			new THREE.Vector2(-0.8,  0.8),
		]), {
			steps: 1,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.2,
			bevelSegments: 5,
		}
	).rotateX(Math.PI / 2);
	shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 1));
	constructor(parent, pos) {
		super(parent, Types.SQUARE);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.OBJ);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
	}
}

export class Triangle extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.6, -0.8),
			new THREE.Vector2( 0.8, -0.8),
			new THREE.Vector2( 0.8,  0.6),
		]), {
			steps: 1,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.2,
			bevelSegments: 5,
		}
	).rotateX(Math.PI / 2);
	shape = new CANNON.ConvexPolyhedron({
		vertices: [
			// Bottom face
			new CANNON.Vec3(-1, -0.5, -1),
			new CANNON.Vec3( 1, -0.5, -1),
			new CANNON.Vec3( 1, -0.5,  1),
			// Top face
			new CANNON.Vec3(-1, 0.5, -1),
			new CANNON.Vec3( 1, 0.5, -1),
			new CANNON.Vec3( 1, 0.5,  1),
		],
		faces: [
			// Bottom face
			[0, 1, 2],
			// Top face
			[3, 4, 5],
			// Side A
			[4, 1, 0],
			[0, 3, 4],
			// Side B
			[2, 5, 3],
			[3, 0, 2],
			// Side C
			[5, 2, 1],
			[1, 4, 5]
		]
	});
	constructor(parent, pos) {
		super(parent, Types.TRIANGLE);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.OBJ);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
	}
}

export class Ispinner extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.2, -1.2),
			new THREE.Vector2( 0.2, -1.2),
			new THREE.Vector2( 0.2,  1.2),
			new THREE.Vector2(-0.2,  1.2),
		]), {
			steps: 1,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.2,
			bevelSegments: 5,
		}
	).rotateX(Math.PI / 2);
	shape = new CANNON.Box(new CANNON.Vec3(0.4, 0.5, 1.4));
	constructor(parent, pos) {
		super(parent, Types.ISPINNER);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.OBJ);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			shape: this.shape,
			material: Physics.WALL
		});
	}
}

export class Tspinner extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.2, -1.2),
			new THREE.Vector2( 0.2, -1.2),
			new THREE.Vector2( 0.2, -0.2),
			new THREE.Vector2( 1.2, -0.2),
			new THREE.Vector2( 1.2,  0.2),
			new THREE.Vector2( 0.2,  0.2),
			new THREE.Vector2( 0.2,  1.2),
			new THREE.Vector2(-0.2,  1.2),
		]), {
			steps: 1,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.2,
			bevelSegments: 5,
		}
	).rotateX(Math.PI / 2);
	shapea = new CANNON.Box(new CANNON.Vec3(0.4, 0.5, 1.4));
	shapeb = new CANNON.Box(new CANNON.Vec3(0.6, 0.5, 0.4));
	constructor(parent, pos) {
		super(parent, Types.TSPINNER);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.OBJ);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			material: Physics.WALL
		}).addShape(
			this.shapea
		).addShape( // TODO: use single shape
			this.shapeb,
			new CANNON.Vec3(0.9, 0, 0),
			undefined
		);
	}
}

export class Xspinner extends Thing {
	geometry = new THREE.ExtrudeGeometry(
		new THREE.Shape([
			new THREE.Vector2(-0.2, -1.2),
			new THREE.Vector2( 0.2, -1.2),
			new THREE.Vector2( 0.2, -0.2),
			new THREE.Vector2( 1.2, -0.2),
			new THREE.Vector2( 1.2,  0.2),
			new THREE.Vector2( 0.2,  0.2),
			new THREE.Vector2( 0.2,  1.2),
			new THREE.Vector2(-0.2,  1.2),
			new THREE.Vector2(-0.2,  0.2),
			new THREE.Vector2(-1.2,  0.2),
			new THREE.Vector2(-1.2, -0.2),
			new THREE.Vector2(-0.2, -0.2),
		]), {
			steps: 1,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.2,
			bevelSegments: 5,
		}
	).rotateX(Math.PI / 2);
	shape = new CANNON.Box(new CANNON.Vec3(0.4, 0.5, 1.4));
	constructor(parent, pos) {
		super(parent, Types.XSPINNER);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.OBJ);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 0.5;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 0.5, pos[2]),
			material: Physics.WALL
		}).addShape(
			this.shape
		).addShape(
			this.shape,
			undefined,
			new CANNON.Quaternion(0, 2 ** 0.5 / 2, 0, 2 ** 0.5 / 2)
		);
	}
}

export class Text extends Thing {
	constructor(parent, pos) {
		super(parent, Types.TEXT);
		this.mesh = new THREE.Object3D();
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 2;
		this.mesh.position.z = pos[2];
		this.mesh.frustumCulled = true;
	}
}

export class Wind extends Thing {
	constructor(parent, pos) {
		super(parent, Types.WIND);
	}
}

export class Powerup extends Thing {
	geometry = new RoundedBoxGeometry(
		1.2,
		1.2,
		1.2,
		3,
		0.2
	);
	shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
	constructor(parent, pos) {
		super(parent, Types.POWERUP);
		this.id = this.parent.powerups.length;
		this.parent.powerups.push(this);
		this.mesh = new THREE.Mesh(this.geometry, this.parent.materials.POWERUP);
		this.mesh.position.x = pos[0];
		this.mesh.position.y = pos[1] + 1;
		this.mesh.position.z = pos[2];
		this.body = new CANNON.Body({
			mass: 0,
			position: new CANNON.Vec3(pos[0], pos[1] + 1, pos[2]),
			shape: this.shape,
			material: Physics.WALL,
			isTrigger: true
		});
		this.got = false;
	}
	unget() {
		this.got = false;
		this.mesh.visible = true;
	}
	onget() {
		if (this.got) return;
		this.parent.scene.confetti.spawn(
			this.mesh.position.x,
			this.mesh.position.y,
			this.mesh.position.z
		);
		this.got = true;
		this.mesh.visible = false;
		window.setTimeout(this.unget.bind(this), 5000);
	}
}

export class Platform extends Thing {
	constructor(parent, pos) {
		super(parent, Types.FLOOR);
		this.flat = undefined;
		let points = [];
		for (let i = 0; i < pos.length; ++i) {
			if (this.flat === undefined)
				this.flat = pos[i][1];
			else if (this.flat !== false && this.flat !== pos[i][1])
				this.flat = false;
			points.push(new THREE.Vector3(pos[i][0], pos[i][1], pos[i][2]));
			points.push(new THREE.Vector3(pos[i][0], pos[i][1] - 1, pos[i][2]));
		}
		if (this.flat !== false) this.flat = true;
		this.geometry = new ConvexGeometry(points);
		this.geometry.computeBoundingBox();
		this.geometry = mergeVertices(this.geometry, 0);
		let center = [
			(this.geometry.boundingBox.min.x + this.geometry.boundingBox.max.x) / 2,
			(this.geometry.boundingBox.min.y + this.geometry.boundingBox.max.y) / 2,
			(this.geometry.boundingBox.min.z + this.geometry.boundingBox.max.z) / 2
		];
		let faces = []; // Generate faces for physics
		for (let i = 0; i < this.geometry.index.array.length; i += 3) {
			faces.push([
				this.geometry.index.array[i],
				this.geometry.index.array[i + 1],
				this.geometry.index.array[i + 2]
			]);
		}
		points = []; // Format geometry points to CANNON.Vec3 for physics
		for (let i = 0; i < this.geometry.attributes.position.array.length; i += 3) {
			this.geometry.attributes.position.array[i] -= center[0];
			this.geometry.attributes.position.array[i + 1] -= center[1];
			this.geometry.attributes.position.array[i + 2] -= center[2];
			points.push(new CANNON.Vec3(
				this.geometry.attributes.position.array[i],
				this.geometry.attributes.position.array[i + 1],
				this.geometry.attributes.position.array[i + 2],
			));
		}
		this.geometry.computeBoundingBox();
		this.mesh = new THREE.Mesh(this.geometry, this.flat ? this.parent.materials.FLOOR1 : this.parent.materials.FLOOR2);
		this.mesh.position.x = center[0];
		this.mesh.position.y = center[1];
		this.mesh.position.z = center[2];
		this.body = new CANNON.Body({
			mass: 0,
			shape: new CANNON.ConvexPolyhedron({
				vertices: points,
				faces: faces
			}),
			material: Physics.FLOOR
		});
		this.body.position.x = center[0];
		this.body.position.y = center[1];
		this.body.position.z = center[2];
	}
}