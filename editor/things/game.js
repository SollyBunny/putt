import { Thing, createElementSVG } from "./thing.js";

class Game extends Thing {
}

export class Player extends Game {
	desc = "A fake player"
}

export class Target extends Game {
	constructor(pos) {
		super(pos);
		this.number = 0;
	}
	elCreate() {
		const el = createElementSVG("circle");
		el.setAttribute("r", 0.25);
		el.setAttribute("fill", "var(--rainbow1)");
		return el;
	}
	elUpdate(el) {
		// TODO use super()
		el.setAttribute("fill", `var(--rainbow${this.number})`);
		el.setAttribute("transform", `translate(${this.pos.get(0)} ${this.pos.get(2)})`);
	}
}

export class Start extends Target {
	desc = "A starting or spawn point"
}

export class Hole extends Target {
	desc = "A hole, the goal"
}

export class Powerup extends Game {
	desc = "A powerup, contains magical powers"
	elCreate() {
		const el = createElementSVG("path");
		const path = "M -0.625 0 L 0 -0.625 L 0.625 0 L 0 0.625 L -0.625 0 M 0.125 0.3125 A 0.125 0.125 90 0 0 -0.125 0.3125 A 0.125 0.125 90 0 0 0.125 0.3125 M 0.125 0 A 0.0625 0.0625 90 0 1 -0.125 0 L -0.125 -0.3125 A 0.0625 0.0625 90 0 1 0.125 -0.3125 L 0.125 0";
		el.setAttribute("d", path);
		el.setAttribute("fill-rule", "evenodd");
		el.setAttribute("fill", "purple");
		return el;
	}
	
}