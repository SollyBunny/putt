
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
	const callback = document.body.removeChild.bind(document.body, el);
	el.addEventListener("click", callback)
	window.setTimeout(callback, DURATION);
}