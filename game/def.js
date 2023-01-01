
const debugmove = true; // turn this to true if you are a gamer skript kiddy hacker man
let a; // the holy debug variable

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

const Types = {
	PLAYER   : -1,
	FLOOR    : 0,
	WALL     : 1,
	START    : 2,
	HOLE     : 3,
	JUMPPAD  : 4,
	BUMPER   : 5,
	SPINNER  : 6,
	TRIANGLE : 7,
	SQUARE   : 8,
	WIND     : 9,
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
