
let splitMain;
let lastSize = {};
function resize() {
	camera.resize();
}

function gutterToggle(event) {
	const ID = event.target.ID;
	const sizes = splitMain.getSizes();
	const size = sizes[ID];
	if (size > 10) {
		splitMain.collapse(ID);
		lastSize[ID] = size;
	} else {
		sizes[1] -= lastSize[ID] - size;
		sizes[ID] = lastSize[ID] || 100;
		splitMain.setSizes(sizes);
	}
}

function gutterCreate(index) {
	const gutter = document.createElement("div");
	gutter.classList.add("gutter");
	gutter.classList.add("gutter-horizontal");
	gutter.ID = index === 1 ? 0 : 2;
	gutter.addEventListener("dblclick", gutterToggle);
	return gutter;
}

export async function init() {
	splitMain = Split(["#sidebar", "#main"], { // body
		onDrag: resize,
		sizes: [20, 80, 20],
		minSize: [0, 100, 0],
		maxSize: [Infinity, Infinity, Infinity],
		gutter: gutterCreate,
	});
	Split(["#settingsplace", "#settingseditor"], { // left
		direction: "vertical",
	});
}
window.addEventListener("resize", resize);