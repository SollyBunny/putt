let ws;
let roomcode;
let playersindex = {};

// Roomcode check
	const e_roomcode = document.getElementById("roomcode");
	if (document.location.search.length > 1) {
		roomcode = document.location.search.slice(1);
		e_roomcode.innerHTML = roomcode; 
	} else {
		roomcode = undefined;
	}

// WS Setup
	try {
		ws = new WebSocket(`wss://${document.location.host}/putt/server.js?${encodeURIComponent(Settings.NAME)}&${Settings.COLOR}` + (roomcode ? `&${roomcode}` : ""));
	} catch (e) {
		console.error(e);
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
	Multi.updatelist = new Float32Array(13);
	Multi.update = () => {
		if (ws.readyState !== WebSocket.OPEN) return;
		if (player.body.sleepState === 2) return;
		Multi.updatelist[0] = player.body.position.x;
		Multi.updatelist[1] = player.body.position.y;
		Multi.updatelist[2] = player.body.position.z;
		Multi.updatelist[3] = player.body.velocity.x;
		Multi.updatelist[4] = player.body.velocity.y;
		Multi.updatelist[5] = player.body.velocity.z;
		Multi.updatelist[6] = player.body.angularVelocity.x;
		Multi.updatelist[7] = player.body.angularVelocity.y;
		Multi.updatelist[8] = player.body.angularVelocity.z;
		Multi.updatelist[9] = player.body.quaternion.x;
		Multi.updatelist[10] = player.body.quaternion.y;
		Multi.updatelist[11] = player.body.quaternion.z;
		Multi.updatelist[12] = player.body.quaternion.w;
		ws.send(Multi.updatelist.buffer);
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
		if (msg.data[0] !== "[") {
			msg.data.arrayBuffer().then(data => {
				console.log(data)
				msg = new Float32Array(data);
				console.log(msg)
				console.log("Sync", msg[13]);
				p = playersindex[msg[13]];
				if (!p) return;
				p.body.position.x        = msg[0];
				p.body.position.y        = msg[1];
				p.body.position.z        = msg[2];
				p.body.velocity.x        = msg[3];
				p.body.velocity.y        = msg[4];
				p.body.velocity.z        = msg[5];
				p.body.angularVelocity.x = msg[6];
				p.body.angularVelocity.y = msg[7];
				p.body.angularVelocity.z = msg[8];
				p.body.quaternion.x      = msg[9];
				p.body.quaternion.y      = msg[10];
				p.body.quaternion.z      = msg[11];
				p.body.quaternion.w      = msg[12];
			});
			return;
		};
		msg = JSON.parse(msg.data);
		switch (msg[0]) {
			case Messages.ERROR:
				alert("Error: " + msg[1]);
				Multi.error = true;
				ws.close();
				break;
			case Messages.MSG:
				alert(msg[1]);
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
				p.del();
				players = players.filter(i => { return i.id !== player.id });
				delete playersindex[msg[1]];
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
