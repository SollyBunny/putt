const buffer = [];
let back = 0;
export function add(undofn, redofn) {
	if (!undofn) throw new Error("no undo function");
	if (!redofn) throw new Error("no redo function");
	if (back !== 0) {
		// remove element after length - back
		for (let i = 0; i < back; i++) buffer.pop();
		back = 0;
	}
	buffer.push([undofn, redofn]);
	console.log(buffer)
	return true;
}
export function undo() {
	if (buffer.length === 0) return false;
	if (back === buffer.length) return false;
	back++;
	buffer[buffer.length - back][0]();
	return true;
}
export function redo() {
	if (buffer.length === 0) return false;
	if (back === 0) return false;
	buffer[buffer.length - back][1]();
	back--;
	return true;
}