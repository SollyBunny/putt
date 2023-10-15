import { Thing, createElementSVG, createElementInput } from "./thing.js";

export class Game extends Thing {
}

export class Player extends Game {
	get id() { return 19; }
	get desc() { return "A fake player"; }
	constructor(pos) {
		super(pos);
		this.properties.set(0, "Noob1234");
		this.properties.set(1, "#123456");
	}
	context() {
		const el = document.createElement("div");
		el.appendChild(createElementInput("text", "Name", "Display name of the player", this.properties.get(0), event => {
			this.properties.set(0, event.target.value);
		}));
		el.appendChild(createElementInput("color", "Color", "Color of the player", this.properties.get(1), event => {
			this.properties.set(1, event.target.value);
		}));
		return el;
	}
}

export class Target extends Game {
	constructor(pos) {
		super(pos);
		this.properties.set(0, 0);
		this.modifiersAllowed = false;
	}
	elUpdate(el) {
		el.setAttribute("fill", `var(--rainbow${(this.properties.get(0) || 0) % 12})`);
		el.setAttribute("transform", `translate(${this.pos.get(0)} ${this.pos.get(2)})`);
	}
	context() {
		const el = createElementInput("number", "Number", "Number of the hole or start", this.properties.get(0), event => {
			const value = parseFloat(event.target.value);
			if (isNaN(value)) return;
			this.properties.set(0, value);
		});
		const input = el.children[0];
		input.setAttribute("min", "0");
		input.setAttribute("step", "1");
		return el;
	}
}

export class Start extends Target {
	get id() { return 20; }
	get desc() { return "A starting or spawn point"; }
	elCreate() {
		const el = createElementSVG("path");
		el.setAttribute("d", "M 0 0.5 L -0.5 0 L -0.25 0 L -0.125 0 L -0.125 -0.75 L 0.125 -0.75 L 0.125 0 L 0.5 0 Z");
		el.setAttribute("fill", "var(--rainbow0)");
		return el;
	}
}

export class Hole extends Target {
	get id() { return 21; }
	get desc() { return "A hole, the goal"; }
	elCreate() {
		const el = createElementSVG("circle");
		el.setAttribute("r", 0.25);
		el.setAttribute("fill", "var(--rainbow0)");
		return el;
	}
}

export class Powerup extends Game {
	get id() { return 22; }
	get desc() { return "A powerup, contains magical powers"; }
	elCreate() {
		const el = createElementSVG("path");
		const path = "M -0.625 0 L 0 -0.625 L 0.625 0 L 0 0.625 L -0.625 0 M 0.125 0.3125 A 0.125 0.125 90 0 0 -0.125 0.3125 A 0.125 0.125 90 0 0 0.125 0.3125 M 0.125 0 A 0.0625 0.0625 90 0 1 -0.125 0 L -0.125 -0.3125 A 0.0625 0.0625 90 0 1 0.125 -0.3125 L 0.125 0 Z";
		el.setAttribute("d", path);
		el.setAttribute("fill-rule", "evenodd");
		el.setAttribute("fill", "purple");
		return el;
	}
}