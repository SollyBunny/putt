import { Thing } from "./thing.js";

class Surface extends Thing {
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