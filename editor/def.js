
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

const Modifiersname = [
	/* TEXT     : */ "Text",
	/* SCALE    : */ "Scale",
	/* MOVE     : */ "Move",
	/* EASEMOVE : */ "Ease Move",
	/* SPIN     : */ "Spin",
	/* BOUNCE   : */ "Bounce",
	/* VELOCITY : */ "Velocity",
	/* COLOR    : */ "Color",
	/* TELEPORT : */ "Teleport",
];

const Modifiersdefault = [
	/* TEXT     : */ "Hello World",
	/* SCALE    : */ [2, 1, 2],
	/* MOVE     : */ [1, 0, 0, 1],
	/* EASEMOVE : */ [1, 0, 0, 1],
	/* SPIN     : */ [0, 1, 0],
	/* BOUNCE   : */ 5,
	/* VELOCITY : */ [0, 5, 0],
	/* COLOR    : */ 0,	
	/* TELEPORT : */ [0, 5, 0],
]

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


const Typesname = [
	/* TEXT       : */ "Text",
	/* FLOOR      : */ "Floor",
	/* BUMPYFLOOR : */ "Bumpy Floor",
	/* WALL       : */ "Wall",
	/* HALFWALL   : */ "Half Wall",
	/* DECOR      : */ "Decor",
	/* START      : */ "Start",
	/* HOLE       : */ "Hole",
	/* BOOSTER    : */ "Booster",
	/* JUMPPAD    : */ "Jump Pad",
	/* BUMPER     : */ "Bumper",
	/* ISPINNER   : */ "I Spinner",
	/* TSPINNER   : */ "T Spinner",
	/* XSPINNER   : */ "X Spinner",
	/* TRIANGLE   : */ "Triangle",
	/* SQUARE     : */ "Square",
	/* WIND       : */ "Wind",
];
Typesname[Types.LAYERUP  ] = "Layer Up";
Typesname[Types.LAYERDOWN] = "Layer Down";
Typesname[Types.REDO     ] = "Redo";
Typesname[Types.UNDO     ] = "Undo";
Typesname[Types.PLAY     ] = "Play";
Typesname[Types.LOAD     ] = "Load";
Typesname[Types.SAVE     ] = "Save";
Typesname[Types.SELECT   ] = "Select";
Typesname[Types.PLAYER   ] = "Player";

const Typesmodifiers = [
	/* TEXT       : */ undefined,
	/* FLOOR      : */ undefined,
	/* BUMPYFLOOR : */ undefined,
	/* WALL       : */ undefined,
	/* HALFWALL   : */ undefined,
	/* DECOR      : */ undefined,
	/* START      : */ undefined,
	/* HOLE       : */ undefined,
	/* BOOSTER    : */ [Modifiers.VELOCITY, [5, 0, 0]],
	/* JUMPPAD    : */ [Modifiers.VELOCITY, [0, 5, 0]],
	/* BUMPER     : */ [Modifiers.BOUNCE, Modifiersdefault[Modifiers.BOUNCE]],
	/* ISPINNER   : */ [Modifiers.SPIN, Modifiersdefault[Modifiers.SPIN]],
	/* TSPINNER   : */ [Modifiers.SPIN, Modifiersdefault[Modifiers.SPIN]],
	/* XSPINNER   : */ [Modifiers.SPIN, Modifiersdefault[Modifiers.SPIN]],
	/* TRIANGLE   : */ [Modifiers.SPIN, Modifiersdefault[Modifiers.SPIN]],
	/* SQUARE     : */ [Modifiers.SPIN, Modifiersdefault[Modifiers.SPIN]],
	/* WIND       : */ undefined,
]
