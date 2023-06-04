function Effect(effect) {
	effect.currentTime = 0;
	effect.play().catch(e => {});
}

Effect.BOUNCE  = new Audio("assets/bounce.wav");
Effect.HIT     = new Audio("assets/hit.wav");
Effect.YAY     = new Audio("assets/yay.wav");
Effect.INFLATE = new Audio("assets/inflate.wav");
Effect.DEFLATE = new Audio("assets/deflate.wav");

export default Effect;

