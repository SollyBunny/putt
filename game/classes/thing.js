let GUID = 0;
class Thing {
	constructor(type, mesh, body, text) {
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
		this.text.style.marginLeft = `-${text.length / 2}ch`;
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
		if (this.text) e_rtext.appendChild(this.text);
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
		if (this.text) this.text.remove();
	}
	bounce(e) {
		let d = Math.atan2(
			e.body.position.x - e.target.position.x,
			e.body.position.z - e.target.position.z,
		);
		e.body.velocity.x = Math.sin(d) * e.target.parent.modbounce;
		e.body.velocity.z = Math.cos(d) * e.target.parent.modbounce;
	}
	velocity(e) {
		e.body.velocity.x += e.target.parent.modvelocity[0];
		e.body.velocity.y  = e.target.parent.modvelocity[1];
		e.body.velocity.z += e.target.parent.modvelocity[2];
	}
}
