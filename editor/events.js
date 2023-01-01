
const e_toolboxcontainer  = document.getElementById("toolboxcontainer");
const e_palletecontainer  = document.getElementById("palletecontainer");
const e_modifiercontainer = document.getElementById("modifiercontainer");

function posinput(id) {
	if (!sel) return;
	let e = parseInt(event.target.value);
	if (e === null) {
		event.target.classList.add("error");
	} else {
		event.target.classList.remove("error");
		historyadd();
		objs[sel][1][id] = e;
		render();
	}
}
function palleteinput(id) {
	if (event.target.value.length === 0) {
		event.target.classList.remove("error");
		objs[1][id] = objsdefault[1][id];
		return;
	}
	if (
		event.target.value.length > 6 ||
		!/[0-9a-fA-F]+$/g.test(event.target.value)
	) {
		event.target.classList.add("error");
		objs[1][id] = objsdefault[1][id];
		return;
	}
	event.target.classList.remove("error");
	objs[1][id] = parseInt(event.target.value, 16);
}
function nameinput() {
	if (event.target.value.length === 0) {
		objs[0][0] = objsdefault[0][0];
		return
	}
	objs[0][0] = event.target.value;
}
const e_rlayer = document.getElementById("rlayer");
function layerinput() {
	if (event.target.value.length === 0) {
		mouse[1] = 0;
		return;
	}
	if (isNaN(parseInt(event.target.value))) {
		event.target.value = mouse[1];
		return;
	}
	mouse[1] = event.target.value = parseInt(event.target.value);
	e_rlayer.style.width = `${String(mouse[1]).length}ch`
}

const e_rtool  = document.getElementById("rtool");
const e_rwarnpoint = document.getElementById("rwarnpoint");
const e_rwarnconvex = document.getElementById("rwarnconvex");
const e_rid = document.getElementById("rid");
const e_rpos = document.getElementById("rpos");
const e_rcontainer = document.getElementById("rcontainer");
function toolset(event, type) {
	sel = undefined;
	e_toolboxcontainer.style.display = e_rcontainer.style.display = "none";
	tool = type;
	if (tool === Types.SELECT)
		e_rtool.innerHTML = Typesname[tool];
	else
		e_rtool.innerHTML = `Placing ${Typesname[tool]}`;
}
function tooledit(id) {
	if (!id) return;
	let obj = objs[id];
	if (!obj) {
		sel = undefined; // selection doesn't exist
		e_rcontainer.style.display = "none";
		return;
	}
	sel = id;
	e_rcontainer.style.display = "block";
	e_rtool.innerHTML = `Selected ${Typesname[obj[0]]}`;
	e_rid.innerHTML = id;
	if (obj[1][0].length === undefined) { // single point obj
		e_rpos.style.display = "block";
		e_rpos.children[0].value = obj[1][0];
		e_rpos.children[1].value = obj[1][1];
		e_rpos.children[2].value = obj[1][2];
	} else {
		e_rpos.style.display = "none";
		if (obj[1].length < 2) {
			e_rwarnpoint.style.display = "block";
		} else {
			e_rwarnpoint.style.display = "none";
			if (/*TODO*/ false) { // isconvex
				e_rwarnconvex.style.display = "block";
			} else {
				e_rwarnconvex.style.display = "none";				
			}
		}
	}
	render();
}

function modadd(mod) {
}
