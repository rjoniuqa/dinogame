function GameUtils(){}

GameUtils.calculateProjectile = function(y, yVelocity, time){
	time = (time < 1) ? 1 : time;
	yVelocity = (!yVelocity) ? Game.DEFAULT_YVELOCITY : yVelocity;
	var dY = y + (yVelocity * time + 0.5 * Game.ACCELERATION * Math.pow(time, 2));
	var dYVelocity = yVelocity + Game.ACCELERATION * time;
	return {dY: dY, dYVelocity: dYVelocity};
}

GameUtils.calculateFrustumWidth = function(distance, aspect, fov){
	var frustumHeight =  2.0 * distance * Math.tan(fov * 0.5 * (Math.PI/180));
	return frustumHeight * aspect * 2;
}

GameUtils.updateHighscore = function(score){
	document.getElementById("highscore").innerHTML = zeroFill(score, 5);
}

GameUtils.updateScore = function(score){
	document.getElementById("currentScore").innerHTML = zeroFill(score, 5);
}

GameUtils.endGame = function(){
	if(currentScore > highScore){
		highScore = Math.round(currentScore);
	}
	GameUtils.updateHighscore(highScore);
	document.getElementById("gameOverHud").style.display = "block";
}

GameUtils.startGame = function(){
	for(var i = 0; i < game.elements.obstacles.length; i++){
		game.elements.obstacles[i].position.z = game.elements.character.position.z - 50;
	}
	lastObstacleZ = 0;
	currentScore = 0;
	Game.OVER = false;
	GameUtils.updateHighscore(highScore);
	GameUtils.updateScore(0);
	game.updateElements();
	game.clock = new THREE.Clock(false);
	game.clock.start();
	render();
}

function zeroFill(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}