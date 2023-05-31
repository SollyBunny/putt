// TODO clean this code

const Messages = {
	WARN      : -2,
	ERROR     : -1,
	MSG       : 0,
	CREATE    : 1,
	JOINSYNC  : 2,
	TICKSYNC  : 3,
	JOIN      : 4,
	LEAVE     : 5,
	SYNC      : 6,
	HOLE      : 7,
	NEXTHOLE  : 8,
	HIT       : 9,
	NEWMAP    : 10,
	READY     : 11,
};

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
		if (ws.url.query[2]) ws.room = rooms[ws.url.query[2]];
		if (ws.room) {
			ws.id    = ws.room.ID
			ws.room.ID += 1;
			ws.name  = decodeURIComponent(ws.url.query[0]);
			ws.color = parseInt(ws.url.query[1], 16);
			ws.hole  = ws.room.hole;
			ws.room.players.forEach(i => {
				i.send(JSON.stringify([Messages.JOIN, ws.id, ws.name, ws.color]));
			});
			ws.send(JSON.stringify([
				Messages.JOINSYNC,
				ws.id,
				ws.room.hole,
				ws.room.players.map(i => {
					return [i.id, i.name, i.color];
				}),
				ws.room.map
			]));
			ws.room.players.push(ws);
			if (ws.room.owner === undefined) ws.room.owner = ws;
			console.log("Putt: Join", ws.ip);
		} else {
			ws.room = random4chars(); // TODO collision check
			ws.room = rooms[ws.room] = {
				ID: 1,
				code: ws.room,
				players: [ ws ],
				hole: 0,
				owner: ws,
				tick: 0,
				start: Date.now(),
			};
			ws.id    = 0;
			ws.name  = decodeURIComponent(ws.url.query[0]);
			ws.color = parseInt(ws.url.query[1], 16);
			ws.hole  = 0;
			ws.send(JSON.stringify([Messages.CREATE, ws.id, ws.room.code]));
			if (ws.url.query[2]) // supplied room code, but it was invalid (NOTE: must come after CREATE message as alert blocks ws stream)
				ws.send(JSON.stringify([Messages.WARN, "Invalid room code, creating new room"]));
			console.log("Putt: Create", ws.ip);
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
		case Messages.SYNC:
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				i.send(JSON.stringify([
					Messages.SYNC,
					ws.id,
					msg[1], msg[2], msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9], msg[10], msg[11], msg[12], msg[13]
				]));
			});
			break;
		case Messages.HOLE:
			ws.hole = msg[1] + 1;
			let hole = ws.hole;
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				if (hole !== i.hole) hole = false;
				i.send(JSON.stringify([Messages.HOLE, ws.id, msg[1]]));
			});
			console.log("Hello", ws.room.players.map(i => i.hole));
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
module.exports.close = (ws) => { // optional
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
setInterval(() => {
	Object.values(rooms).forEach(i => {
		i.tick = Date.now() - i.start;
		i.players.forEach(m => {
			m.send(JSON.stringify([Messages.TICKSYNC, i.tick]))
		})
	})
}, 1000);
