
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
	POWERUP   : 11,
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
	POWERUP    : 15,
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
	TELEPORT : 8,
};

export const Effects = {
	BOUNCE : new Audio("assets/bounce.wav"),
	HIT    : new Audio("assets/hit.wav"),
	YAY    : new Audio("assets/yay.wav"),
};

export const Physics = {
	FLOOR : new CANNON.Material({ restitution: 0.5, friction: 1 }),
	WALL  : new CANNON.Material({ restitution: 1  , friction: 0 }),
	HOLE  : new CANNON.Material({ restitution: 0  , friction: 0 }),
};

export const Powerups = [
	// Local powerups
	["Powerup Box", "Pick up 3 powerups", "hsl(130,100%,50%)", "📦"],
	["Teleport", "Teleport in a small radius around you", "hsl(150,100%,50%)", "🌀"],
	// Global powerups
	["Sticky Walls", "Turn the walls to honey", "hsl(60,100%,50%)", "🍯"],
	["Icy Floors", "Turn the floors to ice", "hsl(65,100%,50%)", "🧊"],
	["Big Balls", "Make dem balls big", "hsl(70,100%,50%)", "⚽"],
	["No Walls", "Make walls disappear", "hsl(75,100%,50%)", "🧱"],
	["Reverse Shot", "Make the next shot reversed", "hsl(80,100%,50%)", "🤔"],
	["Insane Shot", "Make the next shot uncontrollable", "hsl(85,100%,50%)", "💥"],
	// Offensive powerups
	["Bumper", "Place a temporary bumper on the map", "hsl(0,100%,50%)", "🐪"],
	["Steal", "Steal someone's powerup", "hsl(10,100%,50%)", "🏴‍☠"],
	["Swap", "Swap with another player", "hsl(20,100%,50%)", "🥷"],
];


