class Text extends Thing {
	constructor(pos) {
		super(Types.TEXT);
		this.position = new THREE.Vector3(
			pos[0],
			pos[1] + 5,
			pos[2],
		)
	}
}
