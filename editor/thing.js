
import { RAINBOW, TYPESURFACESTART, TYPES, TYPESNAMES, TYPESDESC, MODIFIERS, MODIFIERNAMES, MODIFIERDESCS } from "./def.js";
import { tool } from "./tool.js";

const e_rname = document.getElementById("rname");
const e_rtype = document.getElementById("rtype");
const e_rid = document.getElementById("rid");
const e_draw = document.getElementById("draw");
const e_things = document.getElementById("things");
const e_typesurfaces = document.getElementById("typesurfaces");
const e_rpos = document.getElementById("rpos");
const e_rmod = document.getElementById("rmod");

const SVGNAMESPACE = "http://www.w3.org/2000/svg";

e_rname.addEventListener("input", () => {
	
});

function convexHullify(points) {
	// Find the indices of the points that form the convex hull
	const hullIndices = [];
	// Helper function to find the orientation of three points
	function orientation(p, q, r) {
		const val = (points[q + 2] - points[p + 2]) * (points[r] - points[q]) - (points[r + 2] - points[q + 2]) * (points[q] - points[p]);
		if (val === 0) return 0; // Collinear
		if (val > 0) return 1; // Clockwise orientation
		return 2; // Counterclockwise orientation
	}
	// Find the leftmost point
	let leftmostIndex = 0;
	for (let i = 3; i < points.length; i += 3)
		if (points[i] < points[leftmostIndex])
			leftmostIndex = i;
	let p = leftmostIndex;
	let q;
	do {
		hullIndices.push(p);
		q = (p + 3) % points.length;
		for (let r = 0; r < points.length; r += 3)
			if (orientation(p, q, r) === 2)
				q = r;
		p = q;
	} while (p !== leftmostIndex);
	// Create the ordered convex hull points array
	const out = [];
	for (const i of hullIndices)
		out.push(points[i], points[i + 1], points[i + 2]);
	return out;
}

export class Place {
	things = [];
	holes = [];
	starts = [];
	__sel = undefined;
	set sel(id) {
		this.__sel = this.things[id];
		if (!this.__sel) return;
		toolSet(0);
		if (id === e_rid.value) return;
		e_rid.value = id;
		e_rtype.value = this.things[this.sel].type;
		this.posUpdate();
	}
	get sel() {
		if (this.__sel && tool === 0) return e_rid.value;
		return -1;
	}
	set name(name) {
		e_rname.value = name;
	}
	get name() {
		return e_rname.value;
	}
	toJSON() {
		return [];
	}
	toSVG() {
		return "";
	}
	fromJSON(data) {
		return false;
	}
	posUpdate() {
		e_typesurfaces.disabled = this.__sel.pos.length > 2;
		let out = ""
		for (let i = 0; i < this.__sel.pos.length; i += 3) {
			out += `<div class="vec3">
				<input title="X" type="number" step="any" oninput="place.setPos(${i},event.target.value,false)" value=${this.__sel.pos[i]}>
				<input title="Y" type="number" step="any" oninput="place.setPos(${i + 1},event.target.value,false)" value=${this.__sel.pos[i + 1]}>
				<input title="Z" type="number" step="any" oninput="place.setPos(${i + 2},event.target.value,false)" value=${this.__sel.pos[i + 2]}>
				<button title="Delete" onclick="place.delPos(${i})">X</button>
			</div>`
		}
		e_rpos.innerHTML = out;
	}
	add(type, pos) {
		new Thing(this, type, pos).add();
		this.sel = this.things.length - 1;
	}
	addPos(pos) {
		this.__sel.addPos(pos);
	}
	setPos(index, pos, update) {
		this.__sel.setPos(index, pos, update);
	}
	holesUpdate() {
		this.holes = [];
		for (let m, i = 0; i < this.things.length; ++i) {
			m = this.things[i];
			if (m.type !== TYPES.HOLE) continue;
			if (m.el) m.el.children[0].setAttribute("fill", RAINBOW[this.holes.length % RAINBOW.length])
			this.holes.push(m);
			m.el.children[1].textContent = `Hole ${this.holes.length}`;
		}
	}
	startsUpdate() {
		this.starts = [];
		for (let m, i = 0; i < this.things.length; ++i) {
			m = this.things[i];
			if (m.type !== TYPES.START) continue;
			if (m.el) m.el.children[0].setAttribute("fill", RAINBOW[this.starts.length % RAINBOW.length])
			this.starts.push(m);
			m.el.children[1].textContent = `Start ${this.starts.length}`;
		}
	}
}

export class Thing {
	__type = undefined;
	constructor(parent, type, pos) {
		this.parent = parent;
		this.pos = pos;
		this.type = type;
		this.parent.things.push(this);
		this.elUpdate();
	}
	set type(type) {
		if (type === TYPES.HOLE || this.__type === TYPES.HOLE)
			this.parent.holesUpdate();
		else if (type === TYPES.START || this.__type === TYPES.START)
			this.parent.startsUpdate();
		this.__type = type;
	}
	get type() {
		return this.__type;
	}
	elUpdate() {
		if (this.el) {
			this.del();
			delete this.el;
		}
		let e1, e2;
		switch (this.__type) {
			case TYPES.FLOOR:
			case TYPES.BUMPYFLOOR:
			case TYPES.PLATFORM:
			case TYPES.BUMPYPLATFORM:
			case TYPES.WALL:
			case TYPES.BUMPYWALL:
				if (this.type === TYPES.WALL || this.type === TYPES.BUMPYWALL) {
					this.el = document.createElementNS(SVGNAMESPACE, "polyline");
					this.el.setAttribute("stroke", this.type === TYPES.WALL ? "#fff" : "#aaa");
					this.el.setAttribute("stroke-width", "5");
					this.el.setAttribute("fill", "transparent");
				} else {
					this.el = document.createElementNS(SVGNAMESPACE, "polygon");
					this.el.setAttribute("fill",
						this.type === TYPES.BUMPYFLOOR || this.type === TYPES.BUMPYPLATFORM ? "#888" : "#222"
					);
					this.el.setAttribute("stroke",
						this.type === TYPES.PLATFORM || this.type === TYPES.BUMPYPLATFORM ? "#222" : "#fff"
					);
				}
				e1 = "";
				for (let i = 0; i < this.pos.length; i += 3)
					e1 += `${this.pos[i] * 20},${this.pos[i + 2] * 20} `;
				this.el.setAttribute("points", e1);
				break;
			case TYPES.POWERUP:
			case TYPES.BOX:
				this.el = document.createElementNS(SVGNAMESPACE, "g");
				this.el.style.transform = `translate(${this.pos[0] * 20}px, ${this.pos[2] * 20}px)`;
				e1 = document.createElementNS(SVGNAMESPACE, "rect");
				e1.x.baseVal.value = -20;
				e1.y.baseVal.value = -20;
				e1.width.baseVal.value = 40;
				e1.height.baseVal.value = 40;
				e1.setAttribute("fill", "#222");
				e1.setAttribute("stroke", "#fff");
				this.el.appendChild(e1);
				e2 = document.createElementNS(SVGNAMESPACE, "text");
				e2.textContent = TYPESNAMES[this.type];
				e2.setAttribute("dominant-baseline", "middle");
				e2.setAttribute("text-anchor", "middle");
				e2.setAttribute("fill", "#fff");
				this.el.appendChild(e2);
				break;
			case TYPES.SPHERE:
			case TYPES.CYLINDER:
			case TYPES.CONE:
				this.el = document.createElementNS(SVGNAMESPACE, "g");
				this.el.style.transform = `translate(${this.pos[0] * 20}px, ${this.pos[2] * 20}px)`;
				e1 = document.createElementNS(SVGNAMESPACE, "circle");
				e1.r.baseVal.value = 20;
				e1.setAttribute("fill", "#222");
				e1.setAttribute("stroke", "#fff");
				this.el.appendChild(e1);
				e2 = document.createElementNS(SVGNAMESPACE, "text");
				e2.textContent = TYPESNAMES[this.type];
				e2.setAttribute("dominant-baseline", "middle");
				e2.setAttribute("text-anchor", "middle");
				e2.setAttribute("fill", "#fff");
				this.el.appendChild(e2);
				break;
			case TYPES.HOLE:
			case TYPES.START:
				this.el = document.createElementNS(SVGNAMESPACE, "g");
				this.el.style.transform = `translate(${this.pos[0] * 20}px, ${this.pos[2] * 20}px)`;
				e1 = document.createElementNS(SVGNAMESPACE, "circle");
				e1.r.baseVal.value = 10;
				e1.setAttribute("fill", RAINBOW[(this.__type === TYPES.HOLE ? this.parent.holes : this.parent.starts).length % RAINBOW.length]);
				this.el.appendChild(e1);
				e2 = document.createElementNS(SVGNAMESPACE, "text");
				e2.textContent = `${TYPESNAMES[this.type]} ${(this.__type === TYPES.HOLE ? this.parent.holes : this.parent.starts).length + 1}`;
				e2.setAttribute("dominant-baseline", "middle");
				e2.setAttribute("text-anchor", "middle");
				e2.setAttribute("fill", "#fff");
				this.el.appendChild(e2);
				break;
		}
		this.add();
	}
	add() {
		e_things.appendChild(this.el);
	}
	del() {
		e_things.removeChild(this.el);
	}
	addPos(pos) {
		if (this.type < TYPESURFACESTART) {
			new Thing(this.parent, this.type, pos).add();
			this.parent.sel = this.parent.things.length - 1;
		} else {
			if (
				this.pos.length > 9 &&
				(this.type === TYPES.FLOOR || this.type === TYPES.BUMPYFLOOR || this.type === TYPES.PLATFORM || this.type === TYPES.BUMPYPLATFORM)
			) {
				if (this.pos.indexOf(...pos) === -1)
				this.pos.push(...pos);
				this.pos = convexHullify(this.pos);
			} else {
				this.pos.push(...pos);
			}
			this.elUpdate();
			this.parent.posUpdate();
		}
	}
	setPos(index, pos, update) {
		this.pos[index] = pos;
		this.elUpdate();
		if (this === this.parent.__sel && update !== false)
			this.parent.posUpdate();
	}
}