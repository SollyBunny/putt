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
		this.starts = [];
		this.holes  = [];
		this.things = [];
		// Set colors
			this.materials.BG  .color.setHex(data[0][0]); // Used for floor
			this.materials.MG  .color.setHex(data[0][1]); // Used for triangle, square, spinner, wind
			this.materials.FG  .color.setHex(data[0][2]); // Used for wall
			this.materials.SG  .color.setHex(data[0][3]); // Used for bouncer
			this.materials.HOLE.color.setHex(data[0][2]); // Used for hole
		// Generate Map stuff
			let m;
			for (let i = 1; i < data.length; ++i) {
				m = data[i];
				switch (data[i][0]) {
					case Types.FLOOR    : this.push(new Floor    (m.slice(1), data)); break;
					case Types.WALL     : this.push(new Wall     (m.slice(1)));       break;
					case Types.START    : this.push(new Start    (m[1]));             break;
					case Types.HOLE     : this.push(new Hole     (m[1]));             break;
					case Types.BUMPER   : this.push(new Bumper   (m[1]));             break;
					case Types.JUMPPAD  : this.push(new Jumppad  (m[1]));             break;
					case Types.SPINNER  : this.push(new Spinner  (m[1]));             break;
					case Types.SQUARE   : this.push(new Square   (m[1]));             break;
					case Types.TRIANGLE : this.push(new Triangle (m[1]));             break;
				}
			}
	}
	push(thing) {
		this.things.push(thing);
		thing.parent = this;
		if (thing.type === Types.HOLE) {
			console.log(this.holes);
			thing.id = this.holes.length;
			this.holes.push(thing);
		} else if (thing.type === Types.START) {
			thing.id = this.starts.length;
			this.starts.push(thing);
		}
		if (thing.oncollide)
			thing.body.addEventListener("collide", thing.oncollide);
		if (thing.onpush)
			thing.onpush();
	}
	add() {
		this.things.forEach(i => {
			i.add();
		});
	}
	del() {
		this.things.forEach(i => {
			i.del();
		});
	}
}
