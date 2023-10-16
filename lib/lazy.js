
// A small lazy helper class

class Lazy {
	/**
	 * Represents a book.
	 * @constructor
	 * @template T
	 * @param {function(T): T} first - Called on the first attempted get
	 * @param {function(T): T} load - Called on the first attemtped get and gets after an unload
	 * @param {function(T): T} unload - Called on an unload
	 */
	constructor(first, load, unload) {
		this.loaded = false;
		this.fisted = false;
		this.data = undefined;
		this.fn_first = first;
		this.fn_load = load;
		this.fn_unload = unload;
	}
	get() {
		if (this.loaded === true) return this.data;
		this.loaded = true;
		if (this.firsted === false) {
			this.fisted = true;
			this.data = this.fn_first();
		}
		return this.data = this.fn_load(this.data);
	}
	unload() {
		if (this.loaded === false) return;
		this.loaded = false;
		return this.data = this.unload();
	}
}

export default Lazy;

a = new Lazy()