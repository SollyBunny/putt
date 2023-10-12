import { Thing, createElementSVG } from "./thing.js";

class Surface extends Thing {
	constructor(pos) {
		pos = pos || [0, 0, 0];
		super([
			pos[0] - 2, pos[1], pos[2] - 2,
			pos[0] + 2, pos[1], pos[2] - 2,
			pos[0] + 2, pos[1], pos[2] + 2,
			pos[0] - 2, pos[1], pos[2] + 2,
		]);
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
	desc = "A floor"
}

export class BFloor extends Floor {
	desc = "A bumpy floor"
}

export class Wall extends Surface {
	desc = "A wall"
	elUpdateCallback() {
		if (this.pos.length <= 3) {
			this.pos.data = [];
			return;
		}
		this.elUpdate(this.el);
	}
	elCreate() {
		const el = createElementSVG("polyline");
		el.setAttribute("stroke", "var(--wall)");
		el.setAttribute("stroke-width", "0.2");
		el.setAttribute("fill", "transparent");
		return el;
	}
}

export class BWall extends Wall {
	desc = "A bumpy wall"
}

export class Platform extends Surface {
	desc = "A platform"
}

export class BPlatform extends Platform {
	desc = "A bumpy platform"
}