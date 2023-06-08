import Settings from "./settings.js";
import Maps from "./maps.js";
import { Messages, Powerups } from "./def.js";

export let ws = undefined;

const e_roomcode = document.getElementById("roomcode");

/*
	newmap(data) {
		if (!this.connected) return;
		ws.send(JSON.stringify([
			Messages.NEWMAP,
			data
		]));
	}
	case Messages.NEWMAP:
		this.place.del();
		this.place.setdata(msg[1]);
		this.place.players.forEach(i => i.reset());
		this.place.add();
		break;
*/

class Multi {
	constructor(place, roomcode, onstart) {
		this.place = place;
		this.roomcode = roomcode || "-tutorial";
		this.onstart = onstart;
		this.connected = false;
		if (this.roomcode.startsWith("-")) { // offline
			this.setmap(this.roomcode.slice(1));
			this.online = false;
		} else if (this.roomcode.startsWith("+")) { // create
			this.setmap(this.roomcode.slice(1));
			this.online = true;
		} else { // join
			this.online = true;
			this.mapname = undefined;
		}
		if (this.online) {
			try {
				// Get prepared for websocket
				this.updatelist = new Float32Array(13);
				this.playersindex = {};
				// Open websocket
				ws = new WebSocket(`wss://${document.location.host}${document.location.pathname.slice(0, document.location.pathname.lastIndexOf("/"))}/server.js?${encodeURIComponent(Settings.NAME)}&${Settings.COLOR}` + (roomcode ? `&${roomcode}` : ""));
				ws.onopen = () => {
					console.log("Connected");
					ws.send(Messages.READY.toString());
					// Note: don't set connected here in case of error or disconnect
				};
				ws.onclose = () => {
					this.online = false;
					if (this.connected) {
						this.connected = false;
						alert("Connection Closed!");
					} else { // wasn't connected in the first place, something has gone wrong
						alert("Failed to open websocket, going offline!");
						this.setmap(); // Pick default map
						this.start(0);
					}
					e_roomcode.parentElement.style.display = "none";
				};
			} catch (e) {
				console.error(e);
				if (ws) ws.onclose();
			}
			ws.onmessage = this.onmsg.bind(this);
			// Note: only set roomcode when succsesfully connected so we don't blue golfball the player
		} else {
			this.start(0);
		}
	}
	start(hole) {
		if (!this.onstart) return;
		if (!this.roomcode.startsWith("-")) {
			e_roomcode.parentElement.style.display = "block";
			e_roomcode.textContent = this.roomcode;
		}
		window.history.replaceState({}, "", `${document.location.pathname}?${this.roomcode}`);
		this.onstart(this, hole);
		delete this.onstart;
	}
	setmap(name) {
		this.mapname = name || "tutorial";
		this.mapdata = Maps[this.mapname];
		if (!this.mapdata) {
			alert(`Map "${this.mapname}" not found, defaulting to "tutorial"`);
			this.mapname = "tutorial";
			this.mapdata = Maps["tutorial"];
			if (this.roomcode.startsWith("+"))
				this.roomcode = `+${this.mapname}`;
			else if (this.roomcode.startsWith("-"))
				this.roomcode = `-${this.mapname}`;
		}
	}
	update() {
		if (!this.connected) return;
		this.updatelist[0]  = place.player.body.position.x;
		this.updatelist[1]  = place.player.body.position.y;
		this.updatelist[2]  = place.player.body.position.z;
		this.updatelist[3]  = place.player.body.velocity.x;
		this.updatelist[4]  = place.player.body.velocity.y;
		this.updatelist[5]  = place.player.body.velocity.z;
		this.updatelist[6]  = place.player.body.angularVelocity.x;
		this.updatelist[7]  = place.player.body.angularVelocity.y;
		this.updatelist[8]  = place.player.body.angularVelocity.z;
		this.updatelist[9]  = place.player.body.quaternion.x;
		this.updatelist[10] = place.player.body.quaternion.y;
		this.updatelist[11] = place.player.body.quaternion.z;
		this.updatelist[12] = place.player.body.quaternion.w;
		ws.send(this.updatelist.buffer);
	}
	hit() {
		if (!this.connected) return;
		ws.send(JSON.stringify([ Messages.HIT ]));
	}
	hole(hole) {
		if (this.connected)
			ws.send(JSON.stringify([ Messages.HOLE, hole ]));
		else
			place.sethole(hole + 1);
			
	}
	powerup(id) {
		if (this.connected) {
			ws.send(JSON.stringify([ Messages.POWERUP, id ]));
		} else {
			if (id !== undefined) this.place.powerups[id].onget();
			this.place.player.onpowerup(Math.floor(Math.random() * Powerups.length));
		}
	}
	powerupuse(index) {
		if (!this.connected) return;
		ws.send(JSON.stringify([ Messages.POWERUPUSE, index ]));
	}
	onmsg(msg) {
		let p;
		if (msg.data[0] !== '[') {
			msg.data.arrayBuffer().then(data => {
				window.data = data;
				msg = new Float32Array(data);
				p = this.playersindex[msg[13]];
				if (!p) return;
				if (p.id == this.place.player.id) {
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
				this.connected = false;
				ws.close();
				break;
			case Messages.MSG:
				alert(msg[1]);
				break;
			case Messages.JOINSYNC:
				console.log("Joinsync", msg[1], msg);
				this.connected = true;
				this.place.player.id = msg[1];
				this.playersindex[this.place.player.id] = this.place.player;
				if (msg[3] !== this.mapname) this.setmap(msg[3]);
				msg[5].forEach(i => {
					p = this.place.addplayer(i[1], i[2]);
					p.id = i[0];
					this.playersindex[p.id] = p;
				});
				this.roomcode = msg[2];
				this.start(msg[4]);
				break;
			case Messages.TICKSYNC:
				this.place.tick = msg[1];
				break;
			case Messages.JOIN:
				console.log("Join", msg[1]);
				p = this.place.addplayer(msg[2], msg[3]);
				p.id = msg[1];
				this.playersindex[p.id] = p;
				break;
			case Messages.LEAVE:
				console.log("Leave", msg[1]);
				p = this.playersindex[msg[1]];
				if (!p) break;
				p.del();
				this.place.players = this.place.players.filter(i => { return i.id !== msg[1] });
				delete this.playersindex[msg[1]];
				break;
			case Messages.HIT:
				p = this.playersindex[msg[1]];
				if (!p) break;
				p.onhit();
				break;
			case Messages.HOLE:
				p = this.playersindex[msg[1]];
				if (!p) break;
				break;
			case Messages.NEXTHOLE:
				this.place.sethole(msg[1]);
				break;
			case Messages.POWERUP:
				if (msg[2] !== undefined) this.place.powerups[msg[2]].onget();
				this.playersindex[msg[1]].onpowerup(msg[2]);
				break;
			case Messages.POWERUPUSE:
				this.playersindex[msg[1]].onpowerupuse(msg[2]);
				break;
		}
	};
}

export default Multi;