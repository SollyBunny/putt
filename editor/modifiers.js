export class Type {
	constructor(value) {
		this.value = value;
	}
	clone() {
		return new Type(this.value);
	}
}

export const rotate = new Type(0);
export const scale = new Type(1);
export const translate = new Type(2);

export class Timing {
	constructor(value) {
		this.value = value;
	}
	clone() {
		return new Timing(this.value);
	}
}

export const still = new Timing(0);
export const linear = new Timing(1);
export const ease = new Timing(2);

export class Modifier {
	constructor(type, timing, pos) {
		// Check type via isinstance
		if (!(type instanceof Type))
			throw new Error("Type must be an instance of Type");
		if (!(timing instanceof Timing))
			throw new Error("Timing must be an instance of Timing");
		// Set
		this.type = type.clone();
		this.timing = timing.clone();
		this.pos = pos || [0, 0, 0];
	}
	toObj() {
		return [type, timing, ...pos];
	}
	clone() {
		return new Modifier(
			this.type.clone(),
			this.timing.clone(),
			this.pos.slice()
		);
	}
}

export function fromObj(data) {
	return new Modifier(
		new Type(data[0]),
		new Timing(data[1]),
		[data[2], data[3], data[4]]
	);
}