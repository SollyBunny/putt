let players = [];
class Player extends Thing {
	geometry = new THREE.IcosahedronGeometry(0.3, Settings.HIPOLYBALL ? 5 : 1);
	shape    = new CANNON.Sphere(0.3);
	physics  = new CANNON.Material({
		restitution: 1,
		friction: 1,
	});
	constructor(name, color) {
		super();
		this.color = new THREE.Color(color);
		if (Settings.LIGHTING) {
			this.light = new THREE.PointLight(this.color, 1);
			this.light.decay = 2;
			this.light.distance = 50;
		}
		this.mesh = new THREE.Mesh(
			this.geometry,
			new THREE.MeshLambertMaterial({
				color: this.color,
				flatShading: true,
				transparent: true,
			})
		);
		this.body = new CANNON.Body({
			mass: 0.3,
			shape: this.shape,
			material: this.physics
		});
		this.text = document.createElement("div");
		this.text.innerHTML = name;
		this.text.style.marginLeft = `-${name.length / 2}ch`;
		playertext.appendChild(this.text);
		this.body.position.y = 5;
		this.body.parent = this;
		this.type = Types.PLAYER;
		this.name = name;
		this.isshoot = true;
		this.ishole  = false;
		this.sleepytime = 0;
		this.lastsafe = new CANNON.Vec3();
		players.push(this);
		this.body.addEventListener("collide", this.oncollide);
		this.add();
	}
	reset() {
		this.body.position.x = this.body.position.z = this.body.velocity.x = this.body.velocity.y = this.body.velocity.z = this.body.angularVelocity.x = this.body.angularVelocity.y = this.body.angularVelocity.z = 0;
		this.body.position.y = 5;
		this.body.allowSleep = false;
		this.isshoot = true;
		this.ishole  = false;
		this.sleepytime = 0;
		this.lastsafe = new CANNON.Vec3();
	}
	add() {
		world.addBody(this.body);
		scene.add(this.mesh);
		scene.add(this.light);
	}
	del() {
		world.removeBody(this.body);
		scene.remove(this.mesh);
		scene.remove(this.light);
		this.text.remove();
	}
	hole() {
		this.ishole = true;
		this.mesh.material.opacity = 0.5;
		this.body.sleep();
		if (this.id === player.id) {
			Multi.hole();
		}
	}
	hit() {
		Effects.HIT.play();
	}
	oncollide(e) {
		Effects.BOUNCE.play();
	}
	onupdate() {
		// Project to 2d
			let project = this.mesh.position.project(camera);
			project.x = ( project.x + 1) / 2 * can.width;
			project.y = (-project.y + 1) / 2 * can.height;
			this.text.style.transform = `translate(${project.x}px,${project.y}px)`
		this.mesh.position.x   = this.body.position.x;
		this.mesh.position.y   = this.body.position.y;
		this.mesh.position.z   = this.body.position.z;
		this.mesh.quaternion.x = this.body.quaternion.x;
		this.mesh.quaternion.y = this.body.quaternion.z;
		this.mesh.quaternion.z = this.body.quaternion.y;
		this.mesh.quaternion.w = this.body.quaternion.w;
		this.body.allowSleep = false;
		if (this.light) {
			this.light.position.x = this.body.position.x;
			this.light.position.y = this.body.position.y + 1;
			this.light.position.z = this.body.position.z;
		}
		if (this.ishole) {
		
		} else if (this.body.position.y < -10) {
			this.body.position.x = this.lastsafe.x;
			this.body.position.y = this.lastsafe.y + 5;
			this.body.position.z = this.lastsafe.z;
			this.body.angularVelocity.x = this.body.angularVelocity.y = this.body.angularVelocity.z = this.body.velocity.x = this.body.velocity.y = this.body.velocity.z = 0;
		} else if (Math.sqrt(
			this.body.velocity.x ** 2 +
			this.body.velocity.y ** 2 +
			this.body.velocity.z ** 2
		) < 0.5) {
			this.body.angularVelocity.x = this.body.angularVelocity.y = this.body.angularVelocity.z = this.body.velocity.x = this.body.velocity.z = 0;
			this.isshoot = true;
			this.body.allowSleep = true;
		} else {
			this.isshoot = false;
			this.body.velocity.x *= 0.99 ** (tx / 15);
			this.body.velocity.z *= 0.99 ** (tx / 15);
			this.body.sleepState = 0;
		}
		if (this.body.allowSleep) {
			this.sleepytime += tx;
			if (this.sleepytime < 200) this.body.allowSleep = false;
		} else {
			this.sleepytime = 0;
		}
	}
}
