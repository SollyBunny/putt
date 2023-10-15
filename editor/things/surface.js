import { Thing, createElementSVG } from "./thing.js";

class Surface extends Thing {
	constructor(pos) {
		pos = pos || [0, 0, 0];
		if (pos.length > 3) {
			super(pos);
		} else {
			super([
				pos[0] - 2, pos[1], pos[2] - 2,
				pos[0] + 2, pos[1], pos[2] - 2,
				pos[0] + 2, pos[1], pos[2] + 2,
				pos[0] - 2, pos[1], pos[2] + 2,
			]);
		}
	}
	elCreate() {
		const el = createElementSVG("polygon");
		el.setAttribute("fill", "var(--floor)");
		return el;
	}
	elUpdateCallback() {
		if (this.pos.length <= 6) {
			this.pos.data = [];
			return;
		}
		this.elUpdate(this.el);
	}
	elUpdate(el) {
		let points = "";
		for (let i = 0; i < this.pos.length; i += 3) {
			points += `${this.pos.get(i)} ${this.pos.get(i + 2)},`;
		}
		points = points.slice(0, -1);
		el.setAttribute("points", points);
		return el;
	}
}

export class Floor extends Surface {
	get id() { return 13; }
	get desc() { return "A floor"; }
}

export class BFloor extends Floor {
	get id() { return 14; }
	get desc() { return "A bumpy floor"; }
}

export class Wall extends Surface {
	get id() { return 15; }
	get desc() { return "A wall"; }
	elUpdateCallback() {
		if (this.pos.length <= 3) {
			this.pos.data = [];
			return;
		}
		this.elUpdate(this.el);
	}
	elCreate() {
		const el = createElementSVG("g");
		const ell = createElementSVG("polyline");
		ell.setAttribute("stroke", "var(--wall)");
		ell.setAttribute("stroke-width", "0.2");
		ell.setAttribute("fill", "transparent");
		el.appendChild(ell);
		return el;
	}
	elUpdateCallback() {
		if (this.pos.length <= 6) {
			this.pos.data = [];
			return;
		}
		this.elUpdate(this.el);
	}
	elUpdate(el) {
		let points = "";
		for (let i = 0; i < this.pos.length; i += 3) {
			points += `${this.pos.get(i)} ${this.pos.get(i + 2)},`;
		}
		points = points.slice(0, -1);
		el.firstChild.setAttribute("points", points);
		return el;
	}
}

export class BWall extends Wall {
	get id() { return 16; }
	get desc() { return "A bumpy wall"; }
}

export class Platform extends Surface {
	get id() { return 17; }
	get desc() { return "A platform"; }
}

export class BPlatform extends Platform {
	get id() { return 18; }
	get desc() { return "A bumpy platform"; }
}