import { Thing } from "./thing.js";

class Other extends Thing {
}

export class Cross extends Thing {
	get id() { return 1; }
	get desc() { return "A cross or X shape"; }
}

export class Tee extends Thing {
	get id() { return 2; }
	get desc() { return "A T shape"; }
}

export class Why extends Thing {
	get id() { return 3; }
	get desc() { return "A Y shape with 3 equally spaced arms"; }
}

export class Cone extends Thing {
	get id() { return 4; }
	get desc() { return "An ice cream cone"; }
}

export class Cylinder extends Thing {
	get id() { return 5; }
	get desc() { return "A cylinder or pipe"; }
}

export class Donut extends Thing {
	get id() { return 6; }
	get desc() { return "A donut or torus"; }
}