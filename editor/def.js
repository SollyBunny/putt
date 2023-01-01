
const Modifiers = {
	TEXT     : 0,
	SCALE    : 1,
	MOVE     : 2,
	SPIN     : 3,
	BOUNCE   : 4,
	VELOCITY : 5,
	COLOR    : 6
};

const Modifiersname = [
	/* TEXT     : */ "Text",
	/* SCALE    : */ "Scale",
	/* MOVE     : */ "Move",
	/* SPIN     : */ "Spin",
	/* BOUNCE   : */ "Bounce",
	/* VELOCITY : */ "Velocity",
	/* COLOR    : */ "Color",
];

const Modifiersdefault = [
	/* TEXT     : */ "Hello World",
	/* SCALE    : */ 1,
	/* MOVE     : */ [1, 1, 1],
	/* SPIN     : */ [0, 1, 0],
	/* BOUNCE   : */ 5,
	/* VELOCITY : */ [5, 0, 0],
	/* COLOR    : */ "Color",	
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
	/* TEXT     : */ "Text",
	/* FLOOR    : */ "Floor",
	/* WALL     : */ "Bumpy Floor",
	/* WALL     : */ "Wall",
	/* HALFWALL : */ "Half Wall",
	/* DECOR    : */ "Decor",
	/* START    : */ "Start",
	/* HOLE     : */ "Hole",
	/* BOOSTER  : */ "Booster",
	/* JUMPPAD  : */ "Jump Pad",
	/* BUMPER   : */ "Bumper",
	/* ISPINNER : */ "I Spinner",
	/* TSPINNER : */ "T Spinner",
	/* XSPINNER : */ "X Spinner",
	/* TRIANGLE : */ "Triangle",
	/* SQUARE   : */ "Square",
	/* WIND     : */ "Wind",
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
