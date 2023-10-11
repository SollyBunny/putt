
export function createElementSVG(type) {
	return document.createElementNS("http://www.w3.org/2000/svg", type);
}

class Pos {
	constructor(pos, update) {
		this.data = pos || [0, 0, 0];
		this.update = update;
	}
	get length() {
		return this.data.length;
	}
	get(n) {
		return this.data[n];
	}
	set(n, value) {
		this.data[n] = value;
		this.update();
		return value;
	}
}

export class Thing {
	constructor(pos) {
		console.log("asdasd")
		this.pos = new Pos(pos, this.elUpdateCallback.bind(this));
		this.el = this.elCreate();
		this.elUpdate(this.el);
	}
	elUpdateCallback() {
		this.elUpdate(this.el);
	}
	elCreate() {
		const el = createElementSVG("text");
		el.setAttribute("x", this.pos.get(0));
		el.setAttribute("y", this.pos.get(2));
		el.setAttribute("text-anchor", "middle");
		el.setAttribute("dominant-baseline", "central");
		el.textContent = this.constructor.name;
		this.elUpdate(el);
		return el;
	}
	elUpdate(el) {
		el.style.transform = `translate(${this.pos[0]}, ${this.pos[2]})`;
	}
}