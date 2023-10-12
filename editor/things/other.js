import { Thing, createElementSVG } from "./thing.js";

class Other extends Thing {
}

export class Cross extends Thing {
	desc = "A cross or X shape"
	elCreate() {
		el = createElementSVG("polygon");
		const points = "-0.2 -0.5, 0.2 -0.5, 0.2 -0.2, 0.5 -0.2, 0.5 0.2, 0.2 0.2, 0.2 0.5, -0.2 0.5, -0.2 0.2, -0.5 0.2, -0.5 -0.2, -0.2 -0.2"
		el.setAttribute("points", points);
		return this.el;
	}
}

export class Tee extends Thing {
	desc = "A T shape"
	elCreate() {
		el = createElementSVG("polygon");
		const points = "-0.5 -0.5, 0.5 -0.5, 0.5 -0.1, 0.2 -0.1, 0.2 0.5, -0.2 0.5, -0.2 -0.1, -0.5 -0.1"
		el.setAttribute("points", points);
		return this.el;
	}
}

export class Why extends Thing {
	desc = "A Y shape with 3 equally spaced arms"
	elCreate() {
		el = createElementSVG("polygon");
		const points = "-0.3 -0.4, 0 -0.1, 0.3 -0.4, 0.5 -0.2, 0.2 0.1, 0.2 0.5, -0.2 0.5, -0.2 0.1, -0.5 -0.2"
		el.setAttribute("points", points);
		return this.el;
	}
}

export class Cone extends Thing {
	desc = "An ice cream cone"
	elCreate() {
		el = createElementSVG("path");
		const path = "M 0.5 0.5 L 0 -0.5 L -0.5 0.5 C 0 0.7 0 0.7 0.5 0.5"
		el.setAttribute("d", path);
		return this.el;
	}
}

export class Cylinder extends Thing {
	desc = "A cylinder or pipe"
}

export class Donut extends Thing {
	desc = "A donut or torus"
}