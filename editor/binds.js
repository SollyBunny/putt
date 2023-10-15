let binds = new Map();

export function bind(name, fn) {
	return binds.set(name, fn);
}
export function unbind(name) {
	return binds.delete(name);
}

export function fire(name) {
	if (!binds.has(name))
		return false;
	binds.get(name)();
	return true;
}

