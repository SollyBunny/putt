
let splitMain;
let lastSize = {};
function resize() {
	camera.resize();
}

function gutterToggle(event) {
	// Toggle the collapsed state of a row or column, although this is only used for a pair of columns, this will work for rows, columns and >2 of them
	const ID = event.target.ID;
	const sizes = splitMain.getSizes(); // get the current size of the columns
	const size = sizes[ID]; // get the size of the current column
	if (size > 10) { // should we collapse or expand
		splitMain.collapse(ID); // one of the few builtin functions
		lastSize[ID] = size;
	} else {
		sizes[1] -= lastSize[ID] - size; // remove area from the space uncollapsing into (NaN from `lastSize[ID] - size` will do nothing)
		sizes[ID] = lastSize[ID] || 100; // set the size
		splitMain.setSizes(sizes); // update split.js
	}
}

function gutterCreate(index) {
	// function called to create the gutter
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
