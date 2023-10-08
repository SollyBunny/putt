export class Place {
	constructor() {
		this.things = [];
	}
}

export class Thing {
	constructor(parent) {
		this.parent = parent;
		if (parent) {
			parent.things.append(this);
		}
	}
}

export class Cross extends Thing {
	desc = "A cross or X shape"
	constructor(parent) {
		super(parent);
	}
}

export class Tee extends Thing {
	desc = "A T shape"
	constructor(parent) {
		super(parent);
	}
}

export class Why extends Thing {
	desc = "A Y shape with 3 equally spaced arms"
	constructor(parent) {
		super(parent);
	}
}

export class Cone extends Thing {
	desc = "An ice cream cone"
	constructor(parent) {
		super(parent);
	}
}

export class Cylinder extends Thing {
	desc = "A cylinder or pipe"
	constructor(parent) {
		super(parent);
	}
}

export class Donut extends Thing {
	desc = "A donut or torus"
	constructor(parent) {
		super(parent);
	}
}

export class Tetra extends Thing {
	desc = "A tetrahedron (3D triangle)"
	constructor(parent) {
		super(parent);
	}
}

export class Cube extends Thing {
	desc = "A cube (3D square)"
	constructor(parent) {
		super(parent);
	}
}

export class Octa extends Thing {
	desc = "An octahedron (3D diamond)"
	constructor(parent) {
		super(parent);
	}
}

export class Dodeca extends Thing {
	desc = "A dodecahedron (3D hexagon)"
	constructor(parent) {
		super(parent);
	}
}

export class Icose extends Thing {
	desc = "An icosahedron (dice with 20 sides)"
	constructor(parent) {
		super(parent);
	}
}

export class Sphere extends Thing {
	desc = "A sphere or ball"
	constructor(parent) {
		super(parent);
	}
}

export class Floor extends Thing {
	desc = "A floor"
	constructor(parent) {
		super(parent);
	}
}

export class BFloor extends Thing {
	desc = "A bumpy floor"
	constructor(parent) {
		super(parent);
	}
}

export class Wall extends Thing {
	desc = "A wall"
	constructor(parent) {
		super(parent);
	}
}

export class BWall extends Thing {
	desc = "A bumpy wall"
	constructor(parent) {
		super(parent);
	}
}

export class Platform extends Thing {
	desc = "A platform"
	constructor(parent) {
		super(parent);
	}
}

export class BPlatform extends Thing {
	desc = "A bumpy platform"
	constructor(parent) {
		super(parent);
	}
}

export class Player extends Thing {
	desc = "A fake player"
	constructor(parent) {
		super(parent);
	}
}

export class Start extends Thing {
	desc = "A starting or spawn point"
	constructor(parent) {
		super(parent);
	}
}

export class Hole extends Thing {
	desc = "A hole, the goal"
	constructor(parent) {
		super(parent);
	}
}

export class Powerup extends Thing {
	desc = "A powerup, contains magical powers"
	constructor(parent) {
		super(parent);
	}
}