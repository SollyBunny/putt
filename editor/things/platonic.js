import { Thing, createElementSVG } from "./thing.js";

class Platonic extends Thing {
	elCreate() {
		let el;
		if (this.sides === -1) { // circle
			el = createElementSVG("circle");
			el.setAttribute("r", 0.5);
		} else if (this.sides === 4) { // square
			el = createElementSVG("rect");
			el.setAttribute("width", 1);
			el.setAttribute("height", 1);
			el.setAttribute("x", -0.5);
			el.setAttribute("y", -0.5);
		} else {
			el = createElementSVG("polygon");
			let points = "";
			for (let i = 0; i < this.sides; ++i) {
				points += `${Math.sin(i * 2 * Math.PI / this.sides) / 2} ${Math.cos(i * 2 * Math.PI / this.sides) / 2},`;
			}
			points = points.slice(0, -1);
			el.setAttribute("points", points);
		}
		el.setAttribute("fill", "var(--obj)");
		return el;
	}
}

export class Tetra extends Platonic {
	get sides() { return 3; }
	desc = "A tetrahedron (3D triangle)";
}

export class Cube extends Platonic {
	get sides() { return 4; }
	desc = "A cube (3D square)";
}

export class Octa extends Platonic {
	get sides() { return 8; }
	desc = "An octahedron (3D diamond)";
}

export class Dodeca extends Platonic {
	get sides() { return 12; }
	desc = "A dodecahedron (3D hexagon)";
}

export class Icose extends Platonic {
	get sides() { return 20; }
	desc = "An icosahedron (dice with 20 sides)"
}

export class Sphere extends Platonic {
	get sides() { return -1; }
	desc = "A sphere or ball"
}