let place;
class Place { // Can't call it map because of JS reserving so many names
	materials = {
		BG:   new THREE.MeshLambertMaterial(), // Used for floor
		MG:   new THREE.MeshLambertMaterial(), // Used for triangle, square, spinner, wind
		FG:   new THREE.MeshLambertMaterial(), // Used for wall
		SG:   new THREE.MeshLambertMaterial(), // Used for bouncer
		HOLE: new THREE.MeshLambertMaterial({ side: THREE.BackSide }), // Used for hole
	}
	constructor(data) {
		this.data = data;
		this.mods = {}
		this.mods.text     = [];
		this.mods.move     = [];
		this.mods.easemove = [];
		this.mods.spin     = [];
		this.starts = [];
		this.holes  = [];
		this.things = [];
		// Set colors
			this.materials.BG  .color.setHex(data[1][1]); // Used for floor
			this.materials.MG  .color.setHex(data[1][1]); // Used for triangle, square, spinner, wind
			this.materials.FG  .color.setHex(data[1][2]); // Used for wall
			this.materials.SG  .color.setHex(data[1][3]); // Used for bouncer
			this.materials.HOLE.color.setHex(data[1][2]); // Used for hole
			//scene.background.setHex(data[1][0])
		// Generate Map stuff
			let m, j;
			for (let i = 2; i < data.length; ++i) {
				m = data[i];
				switch (m[0]) {
					case Types.FLOOR      : j = new Floor      (m[1], data); break;
					case Types.BUMPYFLOOR : j = new Bumpyfloor (m[1]      ); break;
					case Types.WALL       : j = new Wall       (m[1]      ); break;
					case Types.HALFWALL   : j = new Halfwall   (m[1]      ); break;
					case Types.START      : j = new Start      (m[1]      ); break;
					case Types.HOLE       : j = new Hole       (m[1]      ); break;
					case Types.BUMPER     : j = new Bumper     (m[1]      ); break;
					case Types.JUMPPAD    : j = new Jumppad    (m[1]      ); break;
					case Types.ISPINNER   : j = new Ispinner   (m[1]      ); break;
					case Types.TSPINNER   : j = new Tspinner   (m[1]      ); break;
					case Types.XSPINNER   : j = new Xspinner   (m[1]      ); break;
					case Types.SQUARE     : j = new Square     (m[1]      ); break;
					case Types.TRIANGLE   : j = new Triangle   (m[1]      ); break;
					case Types.TEXT       : j = new Text       (m[1]      ); break;
				}
				j.parent = this;
				if (m[2]) {
					for (let k = 0; k < m[2].length; ++k) {
						switch (m[2][k][0]) {
							case Modifiers.TEXT:
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
								j.modbounce = m[2][k][1];
								j.body.addEventListener("collide", j.bounce);
								break;
							case Modifiers.VELOCITY:
								j.modvelocity = m[2][k][1];
								console.log(j.modvelocity)
								j.body.addEventListener("collide", j.velocity);
								break;
						}
					}
				}
				this.push(j);
			}
	}
	push(thing) {
		this.things.push(thing);
		if (thing.type === Types.HOLE) {
			thing.id = this.holes.length;
			this.holes.push(thing);
		} else if (thing.type === Types.START) {
			thing.id = this.starts.length;
			this.starts.push(thing);
		}
		if (thing.body)
			thing.body.parent = thing;
		if (thing.onpush)
			thing.onpush();
	}
	add() {
		this.things.forEach(i => {
			i.add();
		});
		e_rmapname.textContent = data[0][0]
		scene.background.setHex(this.data[1][0]);
		scene.fogmaterial.color.setHex(this.data[1][0]);
		scene.fogmaterial.color.addScalar(0.1);
	}
	del() {
		this.things.forEach(i => {
			i.del();
		});
	}
}
