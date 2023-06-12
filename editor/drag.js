
{

	const e_menu = document.getElementById("menu");
	const e_menudrag = document.getElementById("menudrag");

	let startpos = undefined;
	let startwidth = undefined;
	let visible = true;

	e_menudrag.addEventListener("pointerdown", event => {
		e_menudrag.setPointerCapture(event.pointerId);
		startwidth = e_menu.clientWidth;
		startpos = event.clientX;
	}, { passive: true });

	e_menudrag.addEventListener("pointermove", event => {
		if (!startpos) return;
		if (event.clientX < 25) {
			visible = false;
			e_menu.style.display = "none";
			return;
		}
		if (visible === false) {
			visible = true;
			e_menu.style.display = "block";
		}
		e_menu.style.width = Math.floor(event.clientX - startpos + startwidth) + "px";
	}, { passive: true });

	e_menudrag.addEventListener("pointerup", e_menudrag.onpointercancel = () => {
		e_menudrag.releasePointerCapture(event.pointerId);
		startpos = undefined;
	}, { passive: true });

	e_menudrag.addEventListener("dblclick", event => {
		if (visible) {
			visible = false;
			e_menu.style.display = "none";
		} else {
			visible = true;
			e_menu.style.display = "block";
		}
	}, { passive: true });
}

{

	const e_draw = document.getElementById("draw");
	const e_main = document.getElementById("main");
	const e_ptr1 = document.getElementById("ptr1");
	const e_ptr2 = document.getElementById("ptr2");
	const e_circ = document.getElementById("circ");
	const e_lins = document.getElementById("lins");
	const e_linx = document.getElementById("linx");
	const e_liny = document.getElementById("liny");
	const e_linh = document.getElementById("linh");
	const e_txtx = document.getElementById("txtx");
	const e_txty = document.getElementById("txty");
	const e_txth = document.getElementById("txth");

	let drag = false;
	let dragged = false;
	let startx = NaN;
	let starty = NaN;
	let mousex = 0;
	let mousey = 0;
	let offsetx = e_main.clientWidth / 40;
	let offsety = e_main.clientHeight / 40;

	e_main.addEventListener("pointerdown", event => {
		if (event.target.tagName === "LABEL") return;
		startx = event.layerX / 20 - offsetx;
		starty = event.layerY / 20 - offsety;
		drag = true;
		dragged = false;
		e_ptr2.style.transform = `translate(${Math.floor(startx) * 20}px, ${Math.floor(starty) * 20}px)`;
		e_ptr2.children[1].textContent = `${String(Math.floor(startx)).padStart(5, " ")}, ${String(Math.floor(starty)).padStart(5, " ")}`;
		e_lins.style.display = "none";
	}, { passive: true });

	e_main.addEventListener("pointermove", event => {
		if (event.target.tagName === "LABEL") return;
		if (drag) {
			if (!dragged) {
				e_main.setPointerCapture(event.pointerId);
				dragged = true;
			}
			offsetx = event.layerX / 20 - startx;
			offsety = event.layerY / 20 - starty;
			e_ptr2.style.transform = `translate(${Math.floor(startx) * 20}px, ${Math.floor(starty) * 20}px)`;
			e_ptr2.children[1].textContent = `${String(Math.floor(startx)).padStart(5, " ")}, ${String(Math.floor(starty)).padStart(5, " ")}`;
			e_draw.style.transform = `translate(${offsetx * 20}px, ${offsety * 20}px)`;
			e_main.style.backgroundPosition = `calc(${offsetx * 20}px) calc(${offsety * 20}px)`;
		} else {
			mousex = Math.floor(event.layerX / 20 - offsetx);
			mousey = Math.floor(event.layerY / 20 - offsety);
			e_ptr1.style.transform = `translate(${mousex * 20}px, ${(mousey) * 20}px)`;
			e_ptr1.children[1].textContent = `${String(Math.floor(mousex)).padStart(5, " ")}, ${String(Math.floor(mousey)).padStart(5, " ")}`;
			if (!isNaN(startx)) {
				e_lins.style.display = "block";
				// Line X
				e_linx.x1.baseVal.value = mousex * 20;
				e_linx.y1.baseVal.value = mousey * 20;
				e_linx.x2.baseVal.value = Math.floor(startx) * 20;
				e_linx.y2.baseVal.value = mousey * 20;
				// Line Y
				e_liny.x1.baseVal.value = Math.floor(startx) * 20;
				e_liny.y1.baseVal.value = mousey * 20;
				e_liny.x2.baseVal.value = Math.floor(startx) * 20;
				e_liny.y2.baseVal.value = Math.floor(starty) * 20;
				// Line Hyp
				e_linh.x1.baseVal.value = mousex * 20;
				e_linh.y1.baseVal.value = mousey * 20;
				e_linh.x2.baseVal.value = Math.floor(startx) * 20;
				e_linh.y2.baseVal.value = Math.floor(starty) * 20;
				// Text X
				const x = Math.abs(Math.floor(startx - mousex));
				if (x < 8) {
					e_txtx.textContent = "";
				} else {
					e_txtx.textContent = x;
					e_txtx.setAttribute("x", Math.floor(startx + mousex) * 10);
					e_txtx.setAttribute("y", mousey * 20);
				}
				// Text Y
				const y = Math.abs(Math.floor(starty - mousey));
				if (y < 4) {
					e_txty.textContent = "";
				} else {
					e_txty.textContent = Math.abs(Math.floor(starty) - mousey);
					e_txty.setAttribute("x", Math.floor(startx * 20));
					e_txty.setAttribute("y", Math.floor(starty + mousey) * 10);
				}
				// Text H
				let h;
				if (x === 0) {
					h = y;
					e_txth.textContent = "";
				} else if (y == 0) {
					h = x;
					e_txth.textContent = "";
				} else {
					h = Math.sqrt(
						Math.floor(startx - mousex) ** 2 +
						Math.floor(starty - mousey) ** 2
					);
					if (h < 5) {
						e_txth.textContent = "";
					} else {
						e_txth.textContent = h.toFixed(1);
						e_txth.setAttribute("x", Math.floor(startx + mousex) * 10);
						e_txth.setAttribute("y", Math.floor(starty + mousey) * 10);
					}
				}
				// Circle
				e_circ.cx.baseVal.value = mousex * 20;
				e_circ.cy.baseVal.value = mousey * 20;
				e_circ.r.baseVal.value = h * 20;
			}
		}
	}, { passive: true });

	e_main.addEventListener("pointerup", e_main.onpointercancel = event => {
		e_main.releasePointerCapture(event.pointerId);
		drag = false;
	}, { passive: true });

	e_draw.style.transform = `translate(${offsetx * 20}px, ${offsety * 20}px)`;
	e_main.style.backgroundPosition = `calc(${offsetx * 20}px) calc(${offsety * 20}px)`;

}

