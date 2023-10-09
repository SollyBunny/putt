
export function createElementSVG(type) {
	return document.createElementNS("http://www.w3.org/2000/svg", type);
}

export class Thing {
	constructor(pos) {
		this.pos = pos || [0, 0, 0];
	}
	updatePos() {
		this.el.transform = `translate(${this.pos[0]}, ${this.pos[2]})`;
	}
}