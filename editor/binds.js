let binds = new Map();

export function bind(name, conditions, fn) {
	let prev;
	if (binds.has(name))
		prev = binds.get(name);
	else
		prev = [];
	prev.push([conditions, fn]);
	binds.set(name, prev);
}

export function fire(name, conditions) {
	if (!binds.has(name))
		return;
	let fired = binds.get(name);
	for (let i = 0; i < fired.length; i++) {
		for (let thisconditions of fired[i][0]) {
			// check if thisconditions is a subset of conditions
			if (thisconditions.every(condition => conditions.includes(condition))) {
				fired[i][1]();
			}
		}
	}
}

