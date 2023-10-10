
function resize() {
	camera.resize();
}

export async function init() {
	Split(["#left", "#main", "#right"], { // body
		onDrag: resize
	});
	Split(["#selector", "#things"], { // left
		direction: "vertical"
	});
	Split(["#settingsplace", "#settingseditor"], { // right
		direction: "vertical"
	});
}
window.addEventListener("resize", resize);