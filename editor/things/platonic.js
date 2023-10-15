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
	get id() { return 7; }
	get desc() { return "A tetrahedron (3D triangle)"; }
	get sides() { return 3; }
}

export class Cube extends Platonic {
	get id() { return 8; }
	get desc() { return "A cube (3D square)"; }
	get sides() { return 4; }
}

export class Octa extends Platonic {
	get id() { return 9; }
	get desc() { return "An octahedron (3D diamond)"; }
	get sides() { return 8; }
}

export class Dodeca extends Platonic {
	get id() { return 10; }
	get desc() { return "A dodecahedron (3D hexagon)"; }
	get sides() { return 12; }
}

export class Icose extends Platonic {
	get id() { return 11; }
	get desc() { return "An icosahedron (dice with 20 sides)"; }
	get sides() { return 20; }
}

export class Sphere extends Platonic {
	get id() { return 12; }
	get desc() { return "A sphere or ball"; }
	get sides() { return -1; }
}