
export function createElementSVG(type) {
	return document.createElementNS("http://www.w3.org/2000/svg", type);
}

let UUID = 0;
export const data = {};
export function createElementDraggable(type, thing, index) {
	const el = createElementSVG(type);
	el.classList.add("draggable");
	el.id = `draggable${UUID}`;
	data[UUID] = thing;
	UUID += 1;
	return el;
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
	delXYZ(n) {
		this.data.splice(n * 3, 3);
		this.update();
	}
	getXYZ(n) {
		return [this.data[n * 3], this.data[n * 3 + 1], this.data[n * 3 + 2]];
	}
	setXYZ(n, x, y, z) {
		this.data[n * 3    ] = x;
		this.data[n * 3 + 1] = y;
		this.data[n * 3 + 2] = z;
		this.update();
	}
	insertXYZ(n, x, y, z) {
		this.data.splice(n * 3, 0, x, y, z);
		this.update();
	}
	raw() {
		return this.data.slice();
	}
}

export class Thing {
	constructor(pos) {
		this.pos = new Pos(pos, this.elUpdateCallback.bind(this));
		this.el = this.elCreate();
		if (this.el) {
			this.el.title = this.desc;
			this.elUpdate(this.el);
		}
	}
	clone() {
		return new this.constructor(this.pos.raw());
	}
	elUpdateCallback() {
		if (this.pos.length === 0) return;
		this.elUpdate(this.el);
	}
	elCreate() {
		const el = createElementSVG("text");
		el.setAttribute("text-anchor", "middle");
		el.setAttribute("dominant-baseline", "central");
		el.setAttribute("fill", "var(--decor)");
		el.textContent = this.constructor.name;
		this.elUpdate(el);
		return el;
	}
	elUpdate(el) {
		el.setAttribute("transform", `translate(${this.pos.get(0)} ${this.pos.get(2)})`);
	}
	elMoveUp(el) {
		el.parentElement.appendChild(el);
	}
	elMoveDown(el) {
		el.parentElement.insertBefore(el, el.parentElement.firstChild);
	}
}