const NUMANIMATIONS = 3

function spawnbowlingtext(img, text, subtext) {
	const el = document.createElement("div");
	const destroy = document.body.removeChild.bind(document.body, el);
	el.classList.add("bowlingtext");
	el.classList.add("bowlingtext" + Math.floor(Math.random() * NUMANIMATIONS));
	const e_container = document.createElement("div");
	{
		const e_img = document.createElement("div");
		e_img.textContent = img;
		e_container.appendChild(e_img);
	} {
		const e_text = document.createElement("h1");
		e_text.textContent = text;
		e_container.appendChild(e_text);
	} {
		const e_subtext = document.createElement("h2");
		e_subtext.textContent = subtext;
		e_container.appendChild(e_subtext);
	}
	el.appendChild(e_container);
	document.body.appendChild(el);
	window.setTimeout(destroy, 5000);
}

export default spawnbowlingtext;