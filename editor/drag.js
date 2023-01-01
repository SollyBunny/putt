
const e_ptr = document.getElementById("ptr");
const e_rx  = document.getElementById("rx");
const e_ry  = document.getElementById("ry");
const offset    = [0, 0];
let   dragstart = undefined;
let   dragdone = false;

function dragupdate() {
	e_rx.innerHTML = mouse[0] = Math.round((event.offsetX - offset[0]) / 20);
	e_ry.innerHTML = mouse[2] = Math.round((event.offsetY - offset[1]) / 20);
	e_ptr.style.transform = `translate(${mouse[0] * 20 + offset[0]}px,${mouse[2] * 20 + offset[1]}px)`;
}

e_draw.onpointerdown = () => {
	event.preventDefault(); // prevent selection
	dragupdate();
	dragstart = [
		event.offsetX - offset[0],
		event.offsetY - offset[1]
	];
	dragdone = false;
};
e_draw.onpointercancel = () => {
	if (dragdone)
		e_draw.releasePointerCapture(event.pointerId);
	dragstart = undefined;
};
e_draw.onpointerup = () => {
	if (dragdone) {
		e_draw.releasePointerCapture(event.pointerId);
	} else {
		dragstart = undefined;
		click();
		return;	
	}
	dragstart = undefined;
};
e_draw.onpointermove = () => {
	if (!dragdone) {
		e_draw.setPointerCapture(event.pointerId);
		dragdone = true;
	}
	dragupdate();
	if (!dragstart) return;
	offset[0] = event.offsetX - dragstart[0];
	offset[1] = event.offsetY - dragstart[1];
	e_draw.style.backgroundPosition = `${offset[0]}px ${offset[1]}px`;
	e_svg.style.transform = `translate(calc(${offset[0]}px),calc(${offset[1]}px))`;
}
