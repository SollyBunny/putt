
const e_ptr = document.getElementById("ptr");
const e_rx  = document.getElementById("rx");
const e_ry  = document.getElementById("ry");
const offset    = [0, 0];
let   dragstart = undefined;
let   dragdone = false;

function dragupdate(event) {
	e_rx.innerHTML = mouse[0] = Math.round((event.offsetX - offset[0]) / 20);
	e_ry.innerHTML = mouse[2] = Math.round((event.offsetY - offset[1]) / 20);
	e_ptr.style.transform = `translate(${mouse[0] * 20 + offset[0]}px,${mouse[2] * 20 + offset[1]}px)`;
}

e_draw.onpointerdown = event => {
	event.preventDefault(); // prevent selection
	dragupdate(event);
	dragstart = [
		event.offsetX - offset[0],
		event.offsetY - offset[1]
	];
	dragdone = false;
};
e_draw.onpointercancel = event => {
	if (dragdone)
		e_draw.releasePointerCapture(event.pointerId);
	dragstart = undefined;
};
e_draw.onpointerup = event => {
	dragstart = undefined;
	if (dragdone)
		e_draw.releasePointerCapture(event.pointerId);
	else
		click();
};
e_draw.onpointermove = event => {
	if (!dragdone) {
		e_draw.setPointerCapture(event.pointerId);
		dragdone = true;
	}
	dragupdate(event);
	if (!dragstart) return;
	offset[0] = event.offsetX - dragstart[0];
	offset[1] = event.offsetY - dragstart[1];
	e_draw.style.backgroundPosition = `${offset[0]}px ${offset[1]}px`;
	e_svg.style.transform = `translate(calc(${offset[0]}px),calc(${offset[1]}px))`;
}

offset[0] = e_draw.clientWidth / 2;
offset[1] = e_draw.clientHeight / 2;
e_draw.style.backgroundPosition = `${offset[0]}px ${offset[1]}px`;
e_svg.style.transform = `translate(calc(${offset[0]}px),calc(${offset[1]}px))`;
