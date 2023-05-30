
function cyrb53(seed) {
	seed = seed | 0;
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < this.length; ++i) {
		ch = this.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function normalize() {
	let newobjs = [objs[0], objs[1]];
	let start = undefined;
	let o;
	let hash = "";
	for (let i = 2; i < objs.length; ++i) {
		if (objs[i][0] !== Types.START) continue;
		start = objs[i][1];
		break;
	}
	if (start === undefined) start = [0, 0, 0];
	for (let i = 2; i < objs.length; ++i) {
		if (objs[i][1][0].length !== undefined) {
			if (objs[i][1][0].length < 2) continue; // if obj is multi position and has less than 2 points, skip
			o = [
				objs[i][0],
				[]
			];
			for (let m = 0; m < objs[i][1].length; ++m) {
				o[1].push([
					objs[i][1][m][0] - start[0],
					objs[i][1][m][1] - start[1],
					objs[i][1][m][2] - start[2],					
				]);
			}
		} else {
			o = [
				objs[i][0],
				[
					objs[i][1][0] - start[0],
					objs[i][1][1] - start[1],
					objs[i][1][2] - start[2],
				]
			];
		}
		if (objs[i][2]) o.push(objs[i][2]);
		newobjs.push(o);
		hash += JSON.stringify(o);
	}
	newobjs[0][1] = cyrb53(hash);
	return newobjs;
}
function save() {
	window.navigator.clipboard.writeText(JSON.stringify(normalize()));
	alert("Copied to clipboard!");
}
function load() {
	let d = prompt("JSON data");
	if (d === null || d.length === 0) return;
	if (d.endsWith(";")) d = d.slice(0, -1);
	try {
		d = JSON.parse(d);
	} catch (e) {
		alert("Invalid JSON data");
		return;
	}
	objs = d;
	history = []; // remove undo history
	historyoff = 0;
	render();
	toolset(undefined, tool);
}
function svg() {
	alert("Not implemented yet!");
	return;
	// Copy the map as an svg file
	// Need to get the style
	window.navigator.clipboard.writeText(`<svg xmlns="http://www.w3.org/2000/svg>"${e_svg.innerHTML}</svg>`);
	alert("Copied to clipboard!");
}

function play() {
	
}

let history = [];
let historyoff = 0;
function historyadd() {
	if (historyoff !== 0) {
		history = history.slice(0, -historyoff);
		historyoff = 0;
	}
	history.push(JSON.parse(JSON.stringify(objs)));
}
function undo() {
	let c = history.at(-historyoff - 1);
	if (c) {
		historyoff += 1;
		objs = JSON.parse(JSON.stringify(c));
	} else {
		objs = JSON.parse(JSON.stringify(objsdefault));
	}
	tooledit(sel); // object may no longer exist
	render();
}
function redo() {
	if (historyoff === 0) return;
	let c = history.at(-historyoff);
	historyoff -= 1;
	objs = JSON.parse(JSON.stringify(c));
	render();
}

function layerup() {
	++mouse[1];
	e_rlayer.value = mouse[1];
	e_rlayer.style.width = `${String(mouse[1]).length}ch`	;
}
function layerdown() {
	--mouse[1];
	e_rlayer.value = mouse[1];
	e_rlayer.style.width = `${String(mouse[1]).length}ch`
}

function del() {
	historyadd();
	objs.splice(sel, 1);
	e_rcontainer.style.display = "none"; // wet code (event.js)
	e_rtool.innerHTML = `Placing ${Typesname[tool]}`;
	sel = undefined;
	render();
}

function click() {
	switch (tool) {
		case Types.SELECT:
			let mindis = Infinity;
			let minnum = undefined;
			let dis;
			for (let i = 2; i < objs.length; ++i) {
				if (objs[i][1][0].length === undefined) { // single position element
					dis = Math.sqrt(
						(objs[i][1][0] - mouse[0]) ** 2 +
						(objs[i][1][1] - mouse[1]) ** 2 +
						(objs[i][1][2] - mouse[2]) ** 2
					);
					if (dis < mindis) {
						mindis = dis;
						minnum = i;
					}
				} else {
					for (let m = 0; m < objs[i][1].length; ++m) {
						dis = Math.sqrt(
							(objs[i][1][m][0] - mouse[0]) ** 2 +
							(objs[i][1][m][1] - mouse[1]) ** 2 +
							(objs[i][1][m][2] - mouse[2]) ** 2
						);
						if (dis < mindis) {
							mindis = dis;
							minnum = i;
						}
					}
				}
			}
			if (minnum && mindis < 10) {
				tool = objs[minnum][0];
				tooledit(minnum);
			}
			break;
		case Types.PLAYER:
			let c = prompt("HEX Color");
			if (c === null || c.length === 0) return;
			if (!/^[0-9A-Fa-f]{0,6}$/.test(c)) {
				alert("Invalid HEX Color");
				return;
			}
			historyadd();
			objs.push([
				tool,
				[mouse[0], mouse[1], mouse[2]],
				[[Modifiers.COLOR, c]]
			]);
			render();
			tooledit(objs.length - 1);
			break;
		case Types.FLOOR:
		case Types.BUMPYFLOOR:
		case Types.WALL:
		case Types.HALFWALL:
		case Types.DECOR:
			historyadd();
			if (sel && objs[sel][0] === tool) { // add to current object if selected item is of same type
				objs[sel][1].push([mouse[0], mouse[1], mouse[2]]);
				render();
				tooledit(sel);
				break;	
			}
			objs.push([
				tool,
				[[mouse[0], mouse[1], mouse[2]]]
			]);
			render();
			tooledit(objs.length - 1);
			break;
		case Types.TEXT:
			let t = prompt("Enter text");
			if (t === null || t.length === 0) break;
			historyadd();
			objs.push([
				Types.TEXT,
				[mouse[0], mouse[1], mouse[2]],
				[[Modifiers.TEXT, t]]
			]);
			render();
			tooledit(objs.length - 1);
			break;
		case Types.START:
		case Types.HOLE:
		case Types.BOOSTER:
		case Types.BUMPER:
		case Types.ISPINNER:
		case Types.TSPINNER:
		case Types.XSPINNER:
		case Types.TRIANGLE:
		case Types.SQUARE:
		case Types.WIND:
			historyadd();
			objs.push([
				tool,
				[mouse[0], mouse[1], mouse[2]]
			]);
			if (Typesmodifiers[tool]) {
				objs[objs.length - 1][2] = [ JSON.parse(JSON.stringify(Typesmodifiers[tool])) ];
			}
			render();
			tooledit(objs.length - 1);
			break;
	}
}

let l1, l2, l3, l4;
let numstart, numhole;
function render() {
	l1 = l2 = l3 = l4 = ""; // apparently this works
	numstart = numhole = 0;
	for (let i = 2; i < objs.length; ++i) {
		m = objs[i];
		switch (m[0]) {
			case Types.TEXT:
				l1 += `<text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">Text</text>`;
				break;
			case Types.PLAYER:
				l1 += `<circle cx="${m[1][0] * 20}" cy="${m[1][2] * 20}" r="5" /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">Player</text>`;
				break;
			case Types.FLOOR:
				l4 += "<polygon points=\"" + m[1].map(j => { return (j[0] * 20) + "," + (j[2] * 20); }).join(" ") + "\" />";
				break;
			case Types.BUMPYFLOOR:
				l4 += "<polygon style='stroke:gray' points=\"" + m[1].map(j => { return (j[0] * 20) + "," + (j[2] * 20); }).join(" ") + "\" />";
				break;
			case Types.WALL:
				l4 += "<polyline class='wall' points=\"" + m[1].map(j => { return (j[0] * 20) + "," + (j[2] * 20); }).join(" ") + "\" />";
				break;
			case Types.HALFWALL:
				l4 += "<polyline class='wall' style='stroke:gray' points=\"" + m[1].map(j => { return (j[0] * 20) + "," + (j[2] * 20); }).join(" ") + "\" />";
				break;
			case Types.DECOR:
				l3 += "<polyline class='decor' style='stroke:gray' points=\"" + m[1].map(j => { return (j[0] * 20) + "," + (j[2] * 20); }).join(" ") + "\" />";
				break;
			case Types.START:
				l1 += `<circle class="svgspecpt svgspec${numstart}" cx="${m[1][0] * 20}" cy="${m[1][2] * 20}" /><text class="svgspec${numstart}" x="${m[1][0] * 20}" y="${m[1][2] * 20 - 20}">S${numstart + 1}</text>`;
				numstart += 1;
				break;
			case Types.HOLE:
				l1 += `<circle class="svgspecpt svgspec${numhole}" cx="${m[1][0] * 20}" cy="${m[1][2] * 20}" /><text class="svgspec${numhole}" x="${m[1][0] * 20}" y="${m[1][2] * 20 - 20}">H${numhole + 1}</text>`;
				numhole += 1;
				break;
			case Types.BOOSTER:
				l2 += `<rect x="${m[1][0] * 20 - 20}" y="${m[1][2] * 20 - 20}" width="40" height="40" /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">Booster</text>`;
				break;
			case Types.JUMPPAD:
				l2 += `<rect x="${m[1][0] * 20 - 20}" y="${m[1][2] * 20 - 20}" width="40" height="40" /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">Jump Pad</text>`;
				break;
			case Types.BUMPER:
				l2 += `<circle cx="${m[1][0] * 20}" cy="${m[1][2] * 20}" r="20" /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">Bumper</text>`;
				break;
			case Types.ISPINNER:
				l2 += `<rect x="${m[1][0] * 20 - 40}" y="${m[1][2] * 20 - 10}" width="80" height="20" /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">I Spinner</text>`;
				break;
			case Types.TSPINNER:
				l2 += `<polygon points="${m[1][0] * 20 - 40},${m[1][2] * 20 - 10} ${m[1][0] * 20 + 40},${m[1][2] * 20 - 10} ${m[1][0] * 20 + 40},${m[1][2] * 20 + 10} ${m[1][0] * 20 + 10},${m[1][2] * 20 + 10} ${m[1][0] * 20 + 10},${m[1][2] * 20 + 40} ${m[1][0] * 20 - 10},${m[1][2] * 20 + 40} ${m[1][0] * 20 - 10},${m[1][2] * 20 + 10} ${m[1][0] * 20 - 40},${m[1][2] * 20 + 10} " /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">T Spinner</text>`;
				break;
			case Types.XSPINNER:
				l2 += `<polygon points="${m[1][0] * 20 - 40},${m[1][2] * 20 - 10} ${m[1][0] * 20 - 10},${m[1][2] * 20 - 10} ${m[1][0] * 20 - 10},${m[1][2] * 20 - 40} ${m[1][0] * 20 + 10},${m[1][2] * 20 - 40} ${m[1][0] * 20 + 10},${m[1][2] * 20 - 10} ${m[1][0] * 20 + 40},${m[1][2] * 20 - 10} ${m[1][0] * 20 + 40},${m[1][2] * 20 + 10} ${m[1][0] * 20 + 10},${m[1][2] * 20 + 10} ${m[1][0] * 20 + 10},${m[1][2] * 20 + 40} ${m[1][0] * 20 - 10},${m[1][2] * 20 + 40} ${m[1][0] * 20 - 10},${m[1][2] * 20 + 10} ${m[1][0] * 20 - 40},${m[1][2] * 20 + 10} " /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">X Spinner</text>`;
				break;
			case Types.TRIANGLE:
				l2 += `<polygon points="${m[1][0] * 20 - 40},${m[1][2] * 20 - 20} ${m[1][0] * 20 + 20},${m[1][2] * 20 - 20} ${m[1][0] * 20 + 20},${m[1][2] * 20 + 40}" /><text x="${m[1][0] * 20}" y="${m[1][2] * 20}" style="fill:white">Triangle</text>`;
				break;
			case Types.SQUARE:
				l2 += `<rect x="${m[1][0] * 20 - 20}" y="${m[1][2] * 20 - 20}" width="40" height="40" /><text style="fill:white" x="${m[1][0] * 20}" y="${m[1][2] * 20}">Square</text>`;
				break;
		}
	}
	e_svg.innerHTML = l4 + l3 + l2 + l1;
}
