const INPUT = 0;
const DIV = 1;

class Reactive {
	constructor(el, validate, onset, inputcast) {
		this.el = el;
		this.validate = validate;
		this.onset = onset;
		this.inputcast = inputcast
		this.__data = undefined;
		if (this.el.tagName === "INPUT") {
			this.type = INPUT;
			this.el.oninput = this.oninput.bind(this);
		} else {
			this.type = DIV;
		}
	}
	oninput() {
		const value = this.inputcast ? this.inputcast(this.el.value) : this.el.value;
		if (value === this.__data) return;
		if (this.validate) {
			const out = this.validate(value);
			if (out === undefined) {
				this.__data = value;
				this.el.classList.remove("error");
			} else {
				this.__data = out;
				this.el.classList.add("error");
			}
		} else {
			this.__data = value;
		}
		if (this.onset) this.onset(this.__data);
	}
	get data() {
		return this.__data;
	}
	set data(value) {
		value = this.inputcast ? this.inputcast(value) : value;
		if (value === this.__data) return;
		if (this.validate) {
			const out = this.validate(value);
			if (out === undefined) {
				this.__data = value;
				this.el.classList.remove("error");
			} else {
				this.__data = out;
				this.el.classList.add("error");
			}
		} else {
			this.__data = value;
		}
		if (this.type === INPUT)
			this.el.value = value;
		else
			this.el.textContent = value;
		if (this.onset) this.onset(this.__data);
	}
}

export default Reactive;
