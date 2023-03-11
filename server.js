// TODO clean this code

const Messages = {
	ERROR     : 0,
	MSG       : 1,
	CREATE    : 2,
	JOINSYNC  : 3,
	TICKSYNC  : 4,
	JOIN      : 5,
	LEAVE     : 6,
	SYNC      : 7,
	HOLE      : 8,
	HIT       : 9,
	NEWMAP    : 10,
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
	ws.url.query = ws.url.query.split("&");
	if (ws.url.query[2]) ws.room = rooms[ws.url.query[2]];
	if (ws.room) {
		ws.id    = Date.now();
		ws.name  = decodeURIComponent(ws.url.query[0]);
		ws.color = parseInt(ws.url.query[1], 16);
		ws.room.players.forEach(i => {
			i.send(JSON.stringify([Messages.JOIN, ws.id, ws.name, ws.color]));
		});
		ws.send(JSON.stringify([
			Messages.JOINSYNC,
			ws.id,
			ws.room.players.map(i => {
				return [i.id, i.name, i.color];
			}),
			ws.room.map
		]));
		ws.room.players.push(ws);
		if (ws.room.owner === undefined) ws.room.owner = ws;
		console.log("Putt: Join", ws.ip, ws.room);
	} else {
		ws.room = random4chars(); // TODO collision check;
		ws.room = rooms[ws.room] = {
			code: ws.room,
			players: [ ws ],
			owner: ws,
			tick: 0,
			start: Date.now(),
		};
		ws.id    = Date.now();
		ws.name  = decodeURIComponent(ws.url.query[0]);
		ws.color = parseInt(ws.url.query[1], 16);
		ws.send(JSON.stringify([Messages.CREATE, ws.id, ws.room.code]));
		if (ws.url.query[2]) // supplied room code, but it was invalid (NOTE: must come after CREATE message as alert blocks ws stream)
			ws.send(JSON.stringify([Messages.ERROR, "Invalid room code, creating new room"]));
		console.log("Putt: Create", ws.ip, ws.room);
	}
	
};
const updatelist = new Float32Array(14);
module.exports.msg = (ws, msg) => {
	console.log("hi", msg[0])
	if (msg[0] !== "[") { // SYNC message
		try {
			msg = new Float32Array(msg.buffer, msg.byteOffset, 13);
			updatelist.set(msg, 0);
		} catch (e) {
			return;
		}
		updatelist[13] = ws.id;
		ws.room.players.forEach(i => {
			if (i.id === ws.id) return;
			i.send(updatelist);
		});
		return;
	}
	msg = JSON.parse(msg);
	console.log("msg", msg)
	switch (msg[0]) {
		case Messages.SYNC:
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				i.send(JSON.stringify([
					Messages.SYNC,
					ws.id,
					msg[1],
					msg[2],
					msg[3],
					msg[4],
					msg[5],
					msg[6],
					msg[7],
					msg[8],
					msg[9],
					msg[10],
					msg[11],
					msg[12],
					msg[13],
				]));
			});
			break;
		case Messages.HOLE:
			ws.room.players.forEach(i => {
				if (i.id === ws.id) return;
				i.send(JSON.stringify([Messages.HOLE, ws.id]));
			});
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
		if (ws.room.players.length === 0)
			ws.room.owner = undefined;
		else
			ws.room.owner = ws.room.players[0];
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
