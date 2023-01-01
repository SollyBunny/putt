let ws;
let roomcode;
let playersindex = {};

// Roomcode check
	const e_roomcode = document.getElementById("roomcode");
	if (document.location.search.length > 1) {
		roomcode = document.location.search.slice(1);
		e_roomcode.innerHTML = roomcode; 
	} else {
		roomcode = "";
	}

// WS Setup
	try {
		ws = new WebSocket(`wss://${document.location.host}${document.location.pathname.slice(0, document.location.pathname.lastIndexOf("/") + 1)}server.js?${roomcode}&${encodeURIComponent(Settings.NAME)}&${Settings.COLOR}`);
	} catch (e) {
		throw e;
		alert("Your browser does not support Websocket, this game will not work");
	}

// main
	Multi = {};
	Multi.newmap = data => {
		if (ws.readyState === WebSocket.CLOSED) return;
		if (ws.readyState === WebSocket.CONNECTING) {
			alert("Closing connection as it is currently connecting");
			Multi.error = true;
			ws.close();
		}
		ws.send(JSON.stringify([
			Messages.NEWMAP,
			data
		]));
	}
	Multi.update = () => {
		if (ws.readyState !== WebSocket.OPEN) return;
		if (player.body.sleepState === 2) return;
		ws.send(JSON.stringify([
			Messages.SYNC,
			player.body.position.x,
			player.body.position.y,
			player.body.position.z,
			player.body.velocity.x,
			player.body.velocity.y,
			player.body.velocity.z,
			player.body.angularVelocity.x,
			player.body.angularVelocity.y,
			player.body.angularVelocity.z,
			player.body.quaternion.x,
			player.body.quaternion.y,
			player.body.quaternion.z,
			player.body.quaternion.w,
		]));
	}
	Multi.hit = () => {
		ws.send(JSON.stringify([ Messages.HIT ]));
	};
	Multi.hole = () => {
		ws.send(JSON.stringify([ Messages.HOLE ]));
	}
	Multi.error = false;
	ws.onopen = () => {
		console.log("Connected")
	};
	ws.onclose = () => {
		if (Multi.error) return;
		alert("Connection Closed!");
	}
	ws.onmessage = (msg) => {
		let p;
		msg = JSON.parse(msg.data);
		switch (msg[0]) {
			case Messages.ERROR:
				alert("Error: " + msg[1]);
				Multi.error = true;
				ws.close();
				break;
			case Messages.CREATE:
				console.log("Create", msg[1]);
				player.id = msg[1];
				playersindex[player.id] = player;
				roomcode = msg[2];
				e_roomcode.innerHTML = roomcode;
				window.history.replaceState({}, "", `${document.location.pathname}?${roomcode}`);
				break;
			case Messages.JOINSYNC:
				console.log("Joinsync", msg[1]);
				player.id = msg[1];
				playersindex[player.id] = player;
				msg[2].forEach(i => {
					p = new Player(i[1], i[2]);
					p.id = i[0];
					p.add();
					playersindex[p.id] = p;
				});
				if (msg[3]) {
					place.del();
					place = new Place(msg[1]);
					players.forEach(i => {
						i.reset();
					});
				}
				break;
			case Messages.TICKSYNC:
				tick = msg[1];
				break;
			case Messages.JOIN:
				console.log("Join", msg[1]);
				p = new Player(msg[2], msg[3]);
				p.id = msg[1];
				p.add();
				playersindex[p.id] = p;
				break;
			case Messages.LEAVE:
				console.log("Leave", msg[1]);
				p = playersindex[msg[1]];
				if (!p) break;
				p.delete();
				players = players.filter(i => { return i.id !== player.id });
				delete playersindex[msg[1]];
				break;
			case Messages.SYNC:
				console.log("Sync", msg[1]);
				p = playersindex[msg[1]];
				if (!p) break;
				if (msg[1] === player.id) {
					console.log("Sync Warn!");
					break;
				}
				p.body.position.x        = msg[2];
				p.body.position.y        = msg[3];
				p.body.position.z        = msg[4];
				p.body.velocity.x        = msg[5];
				p.body.velocity.y        = msg[6];
				p.body.velocity.z        = msg[7];
				p.body.angularVelocity.x = msg[8];
				p.body.angularVelocity.y = msg[9];
				p.body.angularVelocity.z = msg[10];
				p.body.quaternion.x      = msg[11];
				p.body.quaternion.y      = msg[12];
				p.body.quaternion.z      = msg[13];
				p.body.quaternion.w      = msg[14];
				break;
			case Messages.HIT:
				p = playersindex[msg[1]];
				if (!p) break;
				p.hit();
				break;
			case Messages.HOLE:
				p = playersindex[msg[1]];
				if (!p) break;
				p.hole();
				break;
			case Messages.NEWMAP:
				place.del();
				place = new Place(msg[1]);
				players.forEach(i => {
					i.reset();
				});
				break;
		}
	};
