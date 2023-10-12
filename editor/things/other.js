import { Thing, createElementDraggable } from "./thing.js";

class Other extends Thing {
}

export class Cross extends Thing {
	desc = "A cross or X shape"
	elCreate() {
		const el = createElementDraggable("polygon", this);
		const points = "-0.2 -0.5, 0.2 -0.5, 0.2 -0.2, 0.5 -0.2, 0.5 0.2, 0.2 0.2, 0.2 0.5, -0.2 0.5, -0.2 0.2, -0.5 0.2, -0.5 -0.2, -0.2 -0.2";
		el.setAttribute("points", points);
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}

export class Tee extends Thing {
	desc = "A T shape"
	elCreate() {
		const el = createElementDraggable("polygon");
		const points = "-0.5 -0.5, 0.5 -0.5, 0.5 -0.1, 0.2 -0.1, 0.2 0.5, -0.2 0.5, -0.2 -0.1, -0.5 -0.1";
		el.setAttribute("points", points);
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}

export class Why extends Thing {
	desc = "A Y shape with 3 equally spaced arms"
	elCreate() {
		const el = createElementDraggable("polygon");
		const points = "-0.3 -0.4, 0 -0.1, 0.3 -0.4, 0.5 -0.2, 0.2 0.1, 0.2 0.5, -0.2 0.5, -0.2 0.1, -0.5 -0.2";
		el.setAttribute("points", points);
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}

export class Cone extends Thing {
	desc = "An ice cream cone"
	elCreate() {
		const el = createElementDraggable("path");
		const path = "M 0.5 0.5 L 0 -0.5 L -0.5 0.5 C -0.25 0.75 0.25 0.75 0.5 0.5";
		el.setAttribute("d", path);
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}

export class Cylinder extends Thing {
	desc = "A cylinder or pipe"
	elCreate() {
		const el = createElementDraggable("path");
		const path = "M 0.5 0.5 L 0.5 -0.5 C 0.25 -0.75 -0.25 -0.75 -0.5 -0.5 L -0.5 0.5 C -0.25 0.75 0.25 0.75 0.5 0.5";
		el.setAttribute("d", path);
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}

export class Donut extends Thing {
	desc = "A donut or torus"
	elCreate() {
		const el = createElementDraggable("path");
		const path = "M 0.625 0 A 0.25 0.25 90 0 0 -0.625 0 A 0.25 0.25 90 0 0 0.625 0 M -0.25 0 A 0.25 0.25 90 0 0 0.25 0 A 0.25 0.25 90 0 0 -0.25 0";
		el.setAttribute("d", path);
		el.setAttribute("fill-rule", "evenodd");
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}