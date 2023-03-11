
const debugmove = true; // turn this to true if you are a gamer skript kiddy hacker man
let a; // the holy debug variable

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

const Types = {
	PLAYER     : -1,
	TEXT       : 0,
	FLOOR      : 1,
	BUMPYFLOOR : 2,
	WALL       : 3,
	HALFWALL   : 4,
	DECOR      : 5,
	START      : 6,
	HOLE       : 7,
	BOOSTER    : 8,
	JUMPPAD    : 9,
	BUMPER     : 10,
	ISPINNER   : 11,
	TSPINNER   : 12,
	XSPINNER   : 13,
	TRIANGLE   : 14,
	SQUARE     : 15,
	WIND       : 16,
};

const Modifiers = {
	TEXT     : 0,
	SCALE    : 1,
	MOVE     : 2,
	EASEMOVE : 3,
	SPIN     : 4,
	BOUNCE   : 5,
	VELOCITY : 6,
	COLOR    : 7,
	TELEPORT : 8
};

const Effects = {
	BOUNCE : new Audio("assets/bounce.wav"),
	HIT    : new Audio("assets/hit.wav"),
};

const Physics = {
	FLOOR : new CANNON.Material({ restitution: 0.5, friction: 0 }),
	WALL  : new CANNON.Material({ restitution: 1  , friction: 0 }),
	HOLE  : new CANNON.Material({ restitution: 0  , friction: 0 }),
};


