let binds = new Map();

export function bind(name, conditions, fn) {
	let prev;
	if (binds.has(name))
		prev = binds.get(name);
	else
		prev = [];
	prev.push([conditions, fn]);
	binds.set(name, prev);
	return true;
}

export function unbind(name, conditions, fn) {
	if (!binds.has(name)) return false;
	if (conditions === undefined) // remove all binds with this name
		return binds.delete(name)
	let bindtemp = binds.get(name);
	for (let i = 0; i < bindtemp.length; i++) {
		if (fn) {
			if (bindtemp[i][1] !== fn) continue;
		}
		if (thisconditions.every(condition => conditions.includes(condition)) && conditions.every(condition => thisconditions.includes(condition))) {
			fired.splice(i, 1);
			return true; // can't do multiple as that would modify the list as it's being iterated
		}
	}
	return false;
}

export function fire(name, conditions) {
	if (!binds.has(name)) return;
	conditions = conditions || [];               
	let bindtemp = binds.get(name);
	let fired = false;
	for (let i = 0; i < bindtemp.length; i++) {
		for (let thisconditions of bindtemp[i][0]) {
			// check if thisconditions is a subset of conditions
			if (thisconditions.every(condition => conditions.includes(condition))) {
				bindtemp[i][1](); // fire the callback
				fired = true;
			}
		}
	}
	return fired;
}

