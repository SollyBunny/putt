const e_draw = document.getElementById("draw");
const e_things = document.getElementById("things");

async function saveJSON(copy) {


}

async function saveSVG(copy) {
	const padding = 10;
	const format = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %w %h">
	Your browser doesn't support SVG
	<style>
		:root {
			--fg: #fff;
			--bgd: #111;
			--bg: #222;
			--bgl: #333;
			--bgh: #444;
			--bge: #d22;
		}
	</style>
	<defs>
		<filter x="0" y="0" width="1" height="1" id="bgfill">
			<feFlood flood-color="var(--bg)"></feFlood>
			<feComposite in="SourceGraphic"></feComposite>
		</filter>
	</defs>
	<rect x="-50%" y="-50%" width="100%" height="100%" fill="var(--bg)" stroke="var(--bgh)" />
	<g translate="%x,%y">
		%s
	</g>
	</svg>`.replaceAll(/[\t\n]/g, "");
	const bbox = e_draw.getBBox();
	console.log(bbox)
	return format
		.replaceAll("%x", bbox.x + bbox.width / 2 - padding)
		.replaceAll("%y", bbox.y + bbox.height / 2 - padding)
		.replaceAll("%w", padding * 2 + bbox.width)
		.replaceAll("%h", padding * 2 + bbox.height)
		.replaceAll("%s", e_things.innerHTML)
	;
}

window.saveJSON = saveJSON;
window.saveSVG = saveSVG;