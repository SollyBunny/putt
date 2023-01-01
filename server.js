// TODO clean this code

const Messages = {
	ERROR     : 0,
	CREATE    : 1,
	JOINSYNC  : 2,
	TICKSYNC  : 3,
	JOIN      : 4,
	LEAVE     : 5,
	SYNC      : 6,
	HOLE      : 7,
	HIT       : 8,
	NEWMAP    : 9,
};

function random4chars() {
	let result = "";
	for (let i = 0; i < 5; ++i)
		result += random4chars.chars.charAt(Math.floor(Math.random() * random4chars.chars.length));
	return result;
}
random4chars.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const rooms = {};
module.exports.join = (ws) => { // optional
	ws.url.query = ws.url.query.split("&");
	if (ws.url.query[0].length === 0) {
		ws.room = random4chars(); // TODO collision check;
		ws.room = rooms[ws.room] = {
			code: ws.room,
			players: [ ws ],
			owner: ws,
			tick: 0,
			start: Date.now(),
		};
		ws.id    = Date.now();
		ws.name  = decodeURIComponent(ws.url.query[1]);
		ws.color = parseInt(ws.url.query[2], 16);
		ws.send(JSON.stringify([Messages.CREATE, ws.id, ws.room.code]));
		console.log("Putt: Create", ws.ip, ws.room);
	} else {
		ws.room = rooms[ws.url.query[0]];
		if (ws.room === undefined) {
			ws.send(JSON.stringify([Messages.ERROR, "Invalid Room ID"]));
			ws.close();
			return;
		}
		ws.id    = Date.now();
		ws.name  = decodeURIComponent(ws.url.query[1]);
		ws.color = parseInt(ws.url.query[2], 16);
		console.log(ws.color);
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
	}
	
};
module.exports.msg = (ws, msg) => {
	console.log("msg", ws.ip);//, msg)
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
	console.log("Putt: Tick Sync")
	Object.values(rooms).forEach(i => {
		i.tick = Date.now() - i.start;
		i.players.forEach(m => {
			m.send(JSON.stringify([Messages.TICKSYNC, i.tick]))
		})
	})
}, 1000);
