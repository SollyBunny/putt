
export class Reactive {
	constructor(el, callback, data) {
		this.el = el;
		this.callback = callback;
		if (data === undefined) {
			if (el.tagName === "INPUT") {
				data = el.value;
			} else {
				data = el.textContent;
			}
		}
		if (el.tagName === "INPUT") {
			el.addEventListener("input", this.setFromEl.bind(this));
		}
		this.data = data;
	}
	setFromEl() {
		if (this.el.tagName === "INPUT") {
			this.data = this.el.value;
		} else {
			this.data = this.el.textContent;
		}
		if (this.callback) this.callback();
		return this.data;
	}
	set(data) {
		this.data = data;
		if (el.tagName === "INPUT") {
			el.value = data;
		} else {
			el.textContent = data;
		}
		if (this.callback) this.callback();
		return data;
	}
	get() {
		return this.data;
	}
}