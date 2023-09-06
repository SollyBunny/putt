const e_draw = document.getElementById("draw");
const e_things = document.getElementById("things");

async function saveJSON(copy) {


}

async function saveSVG(copy) {
    const padding = 10;
    const format = `<svg id="draw" xmlns="http://www.w3.org/2000/svg" width="%w" height="%h" viewBox="0 0 10 10">
    Your browser doesn't support SVG
    <defs>
        <filter x="0" y="0" width="1" height="1" id="bgfill">
            <feFlood flood-color="var(--bg)"></feFlood>
            <feComposite in="SourceGraphic"></feComposite>
        </filter>
    </defs>
    <g translate="${padding},${padding}">
        %s
    </g>
    </svg>`;
    
    const bbox = e_draw.getBBox();
    return format
        .replace("%w", padding * 2 + bbox.width)
        .replace("%h", padding * 2 + bbox.height)
        .replace("%s", e_things.innerHTML)
    ;
}

if (ldiff > 0) spr += ldiff;

window.saveJSON = saveJSON;
window.saveSVG = saveSVG;