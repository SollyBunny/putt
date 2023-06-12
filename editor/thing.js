
const e_name = document.getElementById("e_name");

export class Place {
	things = [];
	sel = -1;
	setName(name) {
		this.name = name || "Noob's Place";
		e_name.value = name;
	}
	toJSON() {
		return [];
	}
	fromJSON(data) {
		return false;
	}
	setSel(id) {
		this.sel = id;
	}
}

export class Thing {
	constructor(parent, isSurface, type, pos) {
		this.parent = parent;
		this.isSurface = isSurface;
		this.type = type;
		if (this.isSurface) {
			this.pos = [pos];
		} else {
			this.pos = pos;
		}
		this.parent.things.push(this);
		this.el = undefined; // TODO
	}
	addPos(pos) {
		if (this.isSurface) {
			this.pos.push(pos);
		} else {
			new Thing(this.parent, false, this.type, pos);
		}
	}
}