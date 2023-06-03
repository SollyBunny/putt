
const e_toolboxcontainer  = document.getElementById("toolboxcontainer");
const e_palletecontainer  = document.getElementById("palletecontainer");
const e_modifiercontainer = document.getElementById("modifiercontainer");

function posinput(id) {
	if (!sel) return;
	let e = Number(event.target.value);
	if (e === null) {
		event.target.classList.add("error");
	} else {
		event.target.classList.remove("error");
		historyadd();
		objs[sel][1][id] = e;
		render();
	}
}
function possinput(n, id) {
	if (!sel) return;
	let e = Number(event.target.value);
	if (e === null) {
		event.target.classList.add("error");
	} else {
		event.target.classList.remove("error");
		historyadd();
		objs[sel][2][n][id][1] = e;
		render();
	}
}
function possdel(n) {
	if (!sel) return;
	historyadd();
	objs[sel][1].splice(n, 1);
	render();
	tooledit(sel);
}
function possdel(n) {
	if (!sel) return;
	historyadd();
	objs[sel][1].splice(n, 1);
	render();
	tooledit(sel);
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
	objs[1][id] = Number(event.target.value, 16);
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
	if (isNaN(Number(event.target.value))) {
		event.target.value = mouse[1];
		return;
	}
	mouse[1] = event.target.value = Number(event.target.value);
	e_rlayer.style.width = `${String(mouse[1]).length}ch`
}

const e_rtool  = document.getElementById("rtool");
const e_rwarnpoint = document.getElementById("rwarnpoint");
const e_rwarnconvex = document.getElementById("rwarnconvex");
const e_rid = document.getElementById("rid");
const e_rpos = document.getElementById("rpos");
const e_rposs = document.getElementById("rposs");
const e_rmod = document.getElementById("rmod");
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
		toolset(tool);
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
		e_rposs.innerHTML = "";
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
		let o = "";
		for (let i = 0; i < obj[1].length; ++i) {
			o += `<div class="poss"><input type="number" step="0.1" oninput="possinput(${i},0)" value="${obj[1][i][0]}"><input type="number" step="0.1" oninput="possinput(${i},1)" value="${obj[1][i][1]}"><input type="number"  step="0.1" oninput="possinput(${i},2)" value="${obj[1][i][2]}"><button class="x" onclick="possdel(${i})">X</button></div>`;
		}
		e_rposs.innerHTML = o;
	}
	if (obj[2]) {
		let o = "";
		for (let i = 0; i < obj[2].length; ++i) {
			o += `<h4>${Modifiersname[obj[2][i][0]]}</h4><button class="x" onclick="moddel(${i})">X</button>`;
			switch (obj[2][i][0]) {
				case Modifiers.TEXT:
					o += `<input type="text" placeholder="Hello World" value="${obj[2][i][1]}" oninput="modinput(i)">`;
					break;
				case Modifiers.SCALE:
				case Modifiers.MOVE:
				case Modifiers.SPIN:
				case Modifiers.VELOCITY:
				case Modifiers.TELEPORT:
					console.log("I ADDED A BOUNCE")
					o += `<div class="pos"><input type="number" step="0.1" oninput="possinput(${i},0)" value="${obj[2][i][1][0]}"><input type="number" step="0.1" oninput="possinput(${i},1)" value="${obj[2][i][1][1]}"><input type="number" step="0.1" oninput="possinput(${i},2)" value="${obj[2][i][1][2]}"></div>`;
					break;
				case Modifiers.BOUNCE:
					o += `<input type="text" value="${obj[2][i][1]}" oninput="modinput(i)">`;
					break;				
				case Modifiers.MOVE:
				case Modifiers.EASEMOVE:
					o += `<div class="pos4"><input type="number" step="0.1" oninput="possinput(${i},0)" value="${obj[2][i][1][0]}"><input type="number" step="0.1" oninput="possinput(${i},1)" value="${obj[2][i][1][1]}"><input type="number" step="0.1" oninput="possinput(${i},2)" value="${obj[2][i][1][2]}"><input type="number" step="0.1" oninput="possinput(${i},3)" value="${obj[2][i][1][3]}"></div>`;
					break;
				case Modifiers.COLOR:
					o += `<input type="text" value="${obj[2][i][1].toString(16).toUpperCase().padStart(6, "0")}" oninput="modinput(i)">`;
					break;
			}
		}
		e_rmod.innerHTML = o;		
	} else {
		e_rmod.innerHTML = "";
	}
	render();
}

function modadd(mod) {
	e_modifiercontainer.style.display = "none";
	if (!sel) return;
	if (!objs[sel][2]) {
		objs[sel][2] = [];
	} else if (objs[sel][2].find(i => { return i[0] === mod; }) !== undefined) { // find duplicate (doesn't occur if there aren't any modifiers)
		alert("Modifier already applied!");
		return;
	}
	objs[sel][2].push([mod, Modifiersdefault[mod]]);
	tooledit(sel);
}
function moddel(n) {
	if (!sel) return;
	historyadd();
	objs[sel][2].splice(n, 1);
	tooledit(sel);
}
function modinput(n, id) {
	let obj = objs[sel][2][n];
	let e;
	switch (obj[0]) {
		case Modifiers.TEXT:
			obj[1] = event.target.value;
			break;
		case Modifiers.BOUNCE:
			e = Number(event.target.value);
			if (e === null) {
				event.target.classList.add("error");
				break;
			}
			event.target.classList.remove("error");
			obj[1] = e;
			break;
		case Modifiers.SCALE:
		case Modifiers.SPIN:
		case Modifiers.VELOCITY:
		case Modifiers.MOVE:
		case Modifiers.EASEMOVE:
			e = Number(event.target.value);
			if (e === null) {
				event.target.classList.add("error");
				break;
			}
			event.target.classList.remove("error");
			obj[1][id] = e;
			break;
		case Modifiers.COLOR:
			if (!/^[0-9A-Fa-f]{0,6}$/.test(event.target.value)) {
				event.target.classList.add("error");
				break;
			}
			event.target.classList.remove("error");
			e = Number(event.target.value, 16);
			obj[1] = e;
			break;
	}
}
