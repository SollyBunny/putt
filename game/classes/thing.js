let GUID = 0;
class Thing {
	constructor(mesh, body, type, name) {
		this.mesh = mesh;
		this.body = body;
		this.type = type;
		this.name = name;
		this.GUID = GUID;
		++GUID;
	}
	add() {
		if (this.mesh) scene.add(this.mesh);
		if (this.body) {
			if (this.body.length !== undefined) {
				this.body.forEach(i => {
					world.add(i);
				})
			} else {
				world.add(this.body);
			}
		}
	}
	del() {
		if (this.mesh) scene.remove(this.mesh);
		if (this.body) {
			if (this.body.length !== undefined) {
				this.body.forEach(i => {
					world.removeBody(i);
				})
			} else {
				world.removeBody(this.body);
			}
		}
	}
}
