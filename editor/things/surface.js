import { Thing } from "./thing.js";

class Surface extends Thing {
	constructor(pos) {
		pos = pos || [0, 0, 0];
		super([
			pos[0] - 5, pos[1], pos[2] - 5,
			pos[0] + 5, pos[1], pos[2] - 5,
			pos[0] + 5, pos[1], pos[2] + 5,
			pos[0] - 5, pos[1], pos[2] + 5
		]);
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
}

export class BWall extends Wall {
	desc = "A bumpy wall"
}

export class Platform extends Thing {
	desc = "A platform"
}

export class BPlatform extends Platform {
	desc = "A bumpy platform"
}