// TODO clean this code

const Messages = {
	WARN       : -2,
	ERROR      : -1,
	MSG        : 0,
	JOINSYNC   : 1,
	TICKSYNC   : 2,
	JOIN       : 3,
	LEAVE      : 4,
	SYNC       : 5,
	HOLE       : 6,
	NEXTHOLE   : 7,
	HIT        : 8,
	NEWMAP     : 9,
	READY      : 10,
	POWERUP    : 11,
	POWERUPUSE : 12,
};

const POWERUPNUM = 10;

function random4chars() {
	let result = "";
	for (let i = 0; i < 5; ++i)
		result += random4chars.chars.charAt(Math.floor(Math.random() * random4chars.chars.length));
	return result;
}
random4chars.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const rooms = {};
module.exports.open = ws => { // optional
	ws.ready = false;
};
const updatearraybuffer = new ArrayBuffer(14 * 4);
const updatebuffer = new Uint8Array(updatearraybuffer);
const updatelist = new Float32Array(updatearraybuffer);
module.exports.msg = (ws, msg) => {
	if (!ws.ready) {
		if (msg != Messages.READY) {
			ws.send(JSON.stringify([Messages.ERROR, "Forgot to send ready packet, BAKA."]));
			ws.close();
			return;
		}
		ws.ready = true;
		ws.url.query = ws.url.query.split("&");
		ws.room = rooms[ws.url.query[2]];
		if (
			ws.url.query[2].startsWith("+") || 
			ws.url.query[2].length < 1 ||
			(ws.room === undefined && ws.url.query[2].length > 0)
		) {
			ws.room = random4chars(); // TODO collision check
			ws.room = rooms[ws.room] = {
				ID: 1,
				code: ws.room,
				players: [ws],
				hole: 0,
				owner: ws,
				tick: 0,
				start: Date.now(),
				mapname: ws.url.query[2].startsWith("+") ? ws.url.query[2].slice(1) : "tutorial",
			};
			ws.id    = 0;
			ws.name  = decodeURIComponent(ws.url.query[0]);
			ws.color = parseInt(ws.url.query[1]) || 0;
			ws.hole  = 0;
			ws.send(JSON.stringify([
				Messages.JOINSYNC,
				ws.id,
				ws.room.code,
				ws.room.mapname,
				0,
				[]
			]));
			if (!ws.url.query[2].startsWith("+") && ws.url.query[2].length > 0) // supplied room code, but it was invalid (NOTE: must come after CREATE message as alert blocks ws stream)
				ws.send(JSON.stringify([Messages.WARN, "Invalid room code, creating new room"]));
			console.log("Putt: Create", ws.ip);
		} else {
			ws.id    = ws.room.ID
			ws.room.ID += 1;
			ws.name  = decodeURIComponent(ws.url.query[0]);
			ws.color = parseInt(ws.url.query[1]) || 0;
			ws.hole  = ws.room.hole;
			ws.room.players.forEach(i => {
				i.send(JSON.stringify([Messages.JOIN, ws.id, ws.name, ws.color]));
			});
			ws.send(JSON.stringify([
				Messages.JOINSYNC,
				ws.id,
				ws.room.code,
				ws.room.mapname,
				ws.room.hole,
				ws.room.players.map(i => {
					return [i.id, i.name, i.color];
				})
			]));
			ws.room.players.push(ws);
			if (ws.room.owner === undefined) ws.room.owner = ws;
			console.log("Putt: Join", ws.ip);
		}
		return;
	}
	if (msg[0] !== 91) { // SYNC message (91 == '[')
		updatebuffer.set(msg);
		updatelist[13] = ws.id;
		ws.room.players.forEach(i => {
			if (i.id === ws.id) return;
			i.send(updatelist);
		});
		return;
	}
	try {
		msg = JSON.parse(msg);
	} catch (e) {
		return;
	}
	console.log("Putt: msg", msg);
	switch (msg[0]) {
		case Messages.HOLE:
			ws.hole = msg[1] + 1;
			let hole = ws.hole;
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				if (hole !== i.hole) hole = false;
				i.send(JSON.stringify([Messages.HOLE, ws.id, msg[1]]));
			});
			if (hole !== false) {
				ws.room.hole = hole;
				ws.room.players.forEach(i => {
					i.send(JSON.stringify([Messages.NEXTHOLE, hole]));
				});
			}
			break;
		case Messages.HIT: // This can so easily be abused
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				i.send(JSON.stringify([Messages.HIT, ws.id]));
			});
			break;
		case Messages.POWERUP:
			const powerupnum = Math.floor(Math.random() * POWERUPNUM);
			ws.room.players.forEach(i => {
				i.send(JSON.stringify([Messages.POWERUP, ws.id, msg[1], powerupnum]));
			});
			break;
		case Messages.POWERUPUSE:
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				i.send(JSON.stringify([Messages.POWERUPUSE, ws.id, msg[1]]));
			});
			break;
		case Messages.NEWMAP:
			if (ws.room.owner.id !== ws.id) {
				ws.send(JSON.stringify([Messages.ERROR, "You are not the owner of this room, disconnecting"]));
				ws.close();
				break;
			}
			ws.room.map = msg[1];
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				i.send(JSON.stringify([Messages.NEWMAP, msg[1]]));
			});
			break;
	}
};
module.exports.close = ws => {
	console.log("Putt: Close", ws.ip);
	if (!ws.room) return;
	ws.room.players = ws.room.players.filter(i => {
		i.send(JSON.stringify([Messages.LEAVE, ws.id]))
		return i !== ws
	});
	if (ws.room.owner.id === ws.id) {
		if (ws.room.players.length === 0) {
			delete rooms[ws.room.code];
			return;
		} else {
			ws.room.owner = ws.room.players[0];
		}
	}
	let hole = ws.room.players[0].hole;
	ws.room.players.forEach(i => {
		if (hole !== i.hole) hole = false;
	});
	if (hole !== false) {
		ws.room.hole = hole;
		ws.room.players.forEach(i => {
			i.send(JSON.stringify([Messages.NEXTHOLE, hole]));
		});
	}
};

module.exports.handle = (req, res) => {
	res.writeHead(200, {
		"Content-Type": "text/json",
		"Access-Control-Allow-Origin": "*",
		"Cache-Control": "no-cache"
	})
	res.write(JSON.stringify(Object.values(rooms).map(i => [
		i.code,
		i.players.length,
		i.owner.name,
		i.mapname,
		i.hole
	])));
	res.end();
};

setInterval(() => {
	Object.values(rooms).forEach(i => {
		i.tick = Date.now() - i.start;
		i.players.forEach(m => {
			m.send(JSON.stringify([Messages.TICKSYNC, i.tick]))
		})
	})
}, 5000);
