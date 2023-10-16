import { Thing } from "./thing.js";

export class Game extends Thing {
}

export class Player extends Game {
	get id() { return 19; }
	get desc() { return "A fake player"; }
}

export class Target extends Game {
}

export class Start extends Target {
	get id() { return 20; }
	get desc() { return "A starting or spawn point"; }
}

export class Hole extends Target {
	get id() { return 21; }
	get desc() { return "A hole, the goal"; }
}

export class Powerup extends Game {
	get id() { return 22; }
	get desc() { return "A powerup, contains magical powers"; }
}