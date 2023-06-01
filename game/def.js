
import * as CANNON from "../lib/cannon.min.js";

export const debug = true; // turn this on if you are a script kiddy, or actually need to debug something
export let a; // the holy debug variable

export const Messages = {
	WARN      : -2,
	ERROR     : -1,
	MSG       : 0,
	JOINSYNC  : 1,
	TICKSYNC  : 2,
	JOIN      : 3,
	LEAVE     : 4,
	SYNC      : 5,
	HOLE      : 6,
	NEXTHOLE  : 7,
	HIT       : 8,
	NEWMAP    : 9,
	READY     : 10,
};

export const Types = {
	PLAYER     : -1,
	TEXT       : 0,
	FLOOR      : 1,
	BUMPYFLOOR : 2,
	WALL       : 3,
	DECOR      : 4,
	START      : 5,
	HOLE       : 6,
	BOOSTER    : 7,
	BUMPER     : 8,
	ISPINNER   : 9,
	TSPINNER   : 10,
	XSPINNER   : 11,
	TRIANGLE   : 12,
	SQUARE     : 13,
	WIND       : 14,
};

export const Modifiers = {
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

export const Effects = {
	BOUNCE : new Audio("assets/bounce.wav"),
	HIT    : new Audio("assets/hit.wav"),
};

export const Physics = {
	FLOOR : new CANNON.Material({ restitution: 0.5, friction: 0 }),
	WALL  : new CANNON.Material({ restitution: 1  , friction: 0 }),
	HOLE  : new CANNON.Material({ restitution: 0  , friction: 0 }),
};


