
export function createElementSVG(type) {
	return document.createElementNS("http://www.w3.org/2000/svg", type);
}

export class Thing {
	constructor(pos) {
		this.pos = pos || [0, 0, 0];
		this.el = this.elCreate();
	}
	elCreate() {
		const el = createElementSVG("text");
		el.setAttribute("x", this.pos[0]);
		el.setAttribute("y", this.pos[2]);
		el.setAttribute("text-anchor", "middle");
		el.setAttribute("dominant-baseline", "central");
		el.textContent = this.constructor.name;
		return el;
	}
	updatePos() {
		this.el.transform = `translate(${this.pos[0]}, ${this.pos[2]})`;
	}
}