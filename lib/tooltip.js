
const TOOLTIPSMAX = 3;
const DURATION = 5000;
const keyframes = [
	{ opacity: "0.2", transform: "translate(-50%, 0)" },
	{ opacity: "1", transform: "translate(-50%, -120%)" },
	{  }, {  }, {  }, {  }, {  }, {  }, {  }, {  }, {  }, {  }, {  }, {  },
	{ opacity: "1", transform: "translate(-50%, -120%)" },
	{ opacity: "0.2", transform: "translate(-50%, 0)" },
];
const options = {
	duration: DURATION,
	iterations: 1
};
const tooltips = [];

function callback() {
	// check if this is on document.body
	if (this.parentNode === document.body)
		document.body.removeChild(this);
}

export function make(text) {
	const el = document.createElement("div");
	el.textContent = text;
	el.style.position = "fixed";
	el.style.width = "min-width";
	el.style.height = "min-height";
	el.style.padding = "1vmin";
	el.style.paddingLeft = "4vmin";
	el.style.paddingRight = "4vmin";
	el.style.textAlign = "center";
	el.style.backgroundColor = "var(--bg)";
	el.style.boxShadow = "var(--box-shadow-in), inset var(--box-shadow-out)";
	el.style.borderRadius = "1vmin";
	el.style.left = "50vw";
	el.style.top = "100vh";
	el.style.cursor = "pointer";
	document.body.appendChild(el);
	el.animate(keyframes, options);
	el.addEventListener("click", callback.bind(el));
	window.setTimeout(callback, DURATION);
	tooltips.push(el);
	while (tooltips.length > TOOLTIPSMAX) {
		if (tooltips[0].parentNode === document.body)
			document.body.removeChild(tooltips[0]);
		tooltips.shift();
	}
}