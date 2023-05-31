import Settings from "./settings.js";
import { Messages } from "./def.js";
import { place } from "./main.js";
import { Player } from "./thing.js";

export let ws;
export let roomcode;
export const playersindex = {};

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
	let Multi = {};
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
	Multi.ready = () => {
		if (ws.readyState !== WebSocket.OPEN)
			ws.onopen = () => {
				console.log("Connected")
				ws.send(Messages.READY.toString());
			}
		else
			ws.send(Messages.READY.toString());
	}
	Multi.updatelist = new Float32Array(13);
	Multi.update = () => {
		if (ws.readyState !== WebSocket.OPEN) return;
		if (place.player.body.sleepState === 2) return;
		Multi.updatelist[0]  = place.player.body.position.x;
		Multi.updatelist[1]  = place.player.body.position.y;
		Multi.updatelist[2]  = place.player.body.position.z;
		Multi.updatelist[3]  = place.player.body.velocity.x;
		Multi.updatelist[4]  = place.player.body.velocity.y;
		Multi.updatelist[5]  = place.player.body.velocity.z;
		Multi.updatelist[6]  = place.player.body.angularVelocity.x;
		Multi.updatelist[7]  = place.player.body.angularVelocity.y;
		Multi.updatelist[8]  = place.player.body.angularVelocity.z;
		Multi.updatelist[9]  = place.player.body.quaternion.x;
		Multi.updatelist[10] = place.player.body.quaternion.y;
		Multi.updatelist[11] = place.player.body.quaternion.z;
		Multi.updatelist[12] = place.player.body.quaternion.w;
		ws.send(Multi.updatelist.buffer);
	}
	Multi.hit = () => {
		if (ws.readyState !== WebSocket.OPEN) return;
		ws.send(JSON.stringify([ Messages.HIT ]));
	};
	Multi.hole = hole => {
		if (ws.readyState !== WebSocket.OPEN) return;
		ws.send(JSON.stringify([ Messages.HOLE, hole ]));
	}
	Multi.error = false;
	ws.onopen = () => {
		console.log("Connected");
	};
	ws.onclose = () => {
		if (Multi.error) return;
		alert("Connection Closed!");
	}
	ws.onmessage = msg => {
		let p;
		if (msg.data[0] !== '[') {
			msg.data.arrayBuffer().then(data => {
				window.data = data;
				msg = new Float32Array(data);
				p = playersindex[msg[13]];
				if (!p) return;
				if (p.id == place.player.id) {
					console.warn("Syncing self?");
					return;
				}
				console.log("Sync", msg[13]);
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
			}).catch(e => {
				throw e;
			});
			return;
		};
		try {
			msg = JSON.parse(msg.data);
		} catch (e) {
			return;
		}
		switch (msg[0]) {
			case Messages.WARN:	
				alert("Warn: " + msg[1]);
				break;
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
				place.player.id = msg[1];
				playersindex[place.player.id] = place.player;
				roomcode = msg[2];
				e_roomcode.innerHTML = roomcode;
				window.history.replaceState({}, "", `${document.location.pathname}?${roomcode}`);
				break;
			case Messages.JOINSYNC:
				console.log("Joinsync", msg[1]);
				place.player.id = msg[1];
				playersindex[place.player.id] = place.player;
				place.sethole(msg[2]);
				msg[3].forEach(i => {
					p = place.addplayer(i[1], i[2]);
					p.id = i[0];
					playersindex[p.id] = p;
				});
				if (msg[4]) {
					place.del();
					place.setdata(msg[4]);
					place.players.forEach(i => i.reset);
					place.add();
				}
				break;
			case Messages.TICKSYNC:
				place.tick = msg[1];
				break;
			case Messages.JOIN:
				console.log("Join", msg[1]);
				p = place.addplayer(msg[2], msg[3]);
				p.id = msg[1];
				playersindex[p.id] = p;
				break;
			case Messages.LEAVE:
				console.log("Leave", msg[1]);
				p = playersindex[msg[1]];
				if (!p) break;
				p.del();
				place.players = place.players.filter(i => { return i.id !== msg[1] });
				delete playersindex[msg[1]];
				break;
			case Messages.HIT:
				p = playersindex[msg[1]];
				if (!p) break;
				p.onhit();
				break;
			case Messages.HOLE:
				p = playersindex[msg[1]];
				if (!p) break;
				break;
			case Messages.NEXTHOLE:
				console.log("<3");
				place.sethole(msg[1]);
				break;
			case Messages.NEWMAP:
				place.del();
				place.setdata(msg[1]);
				place.players.forEach(i => i.reset());
				place.add();
				break;
		}
	};

export default Multi;