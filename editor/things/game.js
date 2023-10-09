import { Thing } from "./thing.js";

class Game extends Thing {
}

export class Player extends Game {
	desc = "A fake player"
}

export class Start extends Game {
	desc = "A starting or spawn point"
}

export class Hole extends Game {
	desc = "A hole, the goal"
}

export class Powerup extends Game {
	desc = "A powerup, contains magical powers"
}