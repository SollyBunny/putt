
export const toolnames = [
	"Selecting",
	"Placing Object",
	"Placing Surface",
	"Deleting"
]
export let tool = 0;

const e_menutool = document.getElementById("menutool");

function toolset(id) {
	console.log(id)
	tool = id;
	menutool.textContent = toolnames[tool];
}


// For input events
window.toolset = toolset;