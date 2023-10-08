const e_main = document.getElementById("main");
const e_body = document.getElementById("body");
const e_settings = document.getElementById("settings");

const layout = new GoldenLayout({
	settings: {
		hasHeaders: false,
		selectionEnabled: true
	},
	content: [{
        type: "row",
        content:[{
            type: "column",
			content:[{
				type: "component",
				componentName: "dull",
				componentState: { id: "toolbox" }
			},{
				// type: "stack",
				// content: Object.values(document.getElementsByClassName("tool")).map(i => { return {
				// 	type: "component",
				// 	componentName: "dull",
				// 	componentState: { id: i.id }
				// }; })
				type: "component",
				componentName: "dull",
				componentState: { label: "None" }
			}]
        },{
			type: "component",
			componentName: "main",
		},{
			type: "component",
			componentName: "settings",
		}]
    }]
});
layout.container = "#body";
layout.tools = {};

layout.registerComponent("dull", function(container, state) {
	container.getElement().html("<h2>" + state.label + "</h2>");
});
layout.registerComponent("main", function(container, state) {
	container.on("resize", camera.resize);
	container.getElement()[0].appendChild(e_main);
});
layout.registerComponent("settings", function(container, state) {
	container.getElement()[0].appendChild(e_settings);
});
layout.registerComponent("tool", function(container, state) {
	layout.tools[state.id] = container.parent;
	const el = document.getElementById(state.id);
	container.getElement()[0].appendChild(el);
});

window.layout = layout;

function onResize() {
	const bounding = e_body.getBoundingClientRect();
	console.log(`Resized to ${bounding.width}x${bounding.height}`);
	layout.updateSize(bounding.width, bounding.height);
}

export function init() {
	layout.init();
	window.addEventListener("resize", onResize);
}

