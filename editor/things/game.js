import { Thing } from "./thing.js";

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
		el = createElementSVG("circle");
		el.setAttribute("r", 0.25);
		el.setAttribute("fill", "var(--rainbow1)");
		return this.el;
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
		el = createElementSVG("path");
		const path = "M -2.5 0 L 0 -2.5 L 2.5 0 L 0 2.5 L -2.5 0 M 0.5 1.25 A 0.5 0.5 90 0 0 -0.5 1.25 A 0.5 0.5 90 0 0 0.5 1.25 M 0.5 0 A 0.25 0.25 90 0 1 -0.5 0 L -0.5 -1.25 A 0.25 0.25 90 0 1 0.5 -1.25 L 0.5 0";
		el.setAttribute("d", path);
		el.setAttribute("fill", "purple");
		return this.el;
	}
	
}