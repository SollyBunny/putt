import { Thing, createElementSVG } from "./thing.js";

class Platonic extends Thing {
	constructor(pos) {
		super(pos);
		if (this.sides === -1) { // circle
			this.el = createElementSVG("circle");
			this.el.setAttribute("r", 0.5);
		} else if (this.sides === 4) { // square
			this.el = createElementSVG("rect");
			this.el.setAttribute("width", 1);
			this.el.setAttribute("height", 1);
			this.el.setAttribute("x", -0.5);
			this.el.setAttribute("y", -0.5);
		} else {
			this.el = createElementSVG("path")
			let path = "";
			path += "M0.5 0";
			// console.log(this.sides, this, this.getAttribute("sides"));
			for (let i = 0; i < this.sides; ++i) {
				path += ` L${sin(i * 2 * Math.PI / this.sides)} ${cos(i * 2 * Math.PI / this.sides)}`;
			}
			this.el.setAttribute("d", path);
		}
		this.el.setAttribute("fill", "red");
		this.el.setAttribute("stroke", "black");
		this.el.setAttribute("title", this.desc);
	}
}

export class Tetra extends Platonic {
	sides = 3;
	desc = "A tetrahedron (3D triangle)";
}

export class Cube extends Platonic {
	sides = 4;
	desc = "A cube (3D square)";
}

export class Octa extends Platonic {
	sides = 8;
	desc = "An octahedron (3D diamond)";
}

export class Dodeca extends Platonic {
	sides = 12;
	desc = "A dodecahedron (3D hexagon)";
}

export class Icose extends Platonic {
	sides = 20;
	desc = "An icosahedron (dice with 20 sides)"
}

export class Sphere extends Platonic {
	sides = -1;
	desc = "A sphere or ball"
}