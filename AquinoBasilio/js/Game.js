var game;
var highScore = 0;
var currentScore = 0;
Game.ACCELERATION = -0.05;
Game.DEFAULT_YVELOCITY = 0.85;
Game.FLOOR_Y = -50;
Game.JUMP_KEY = 32;
Game.NUM_TREES = 100;
Game.CAMERA_ZOOM_OUT = 35;
Game.CAMERA_ELEVATION = 10;
Game.CAMERA_ADVANCE = 10;
Game.DEFAULT_CHARACTER_SPEED = 0.5;
Game.MIN_OBSTACLE_DISTANCE = 15;
Game.obstaclesForRepositioning = [];
Game.OVER = false;
Game.MAX_FOV = 50;
Game.CAMERA_FAR = 1000;
Game.CAMERA_NEAR = 1;
Game.CAMERA_FOV = 45;
Game.CAMERA_ASPECT = window.innerWidth / window.innerHeight;
Game.SUN_X = 100;
Game.SUN_Y = Game.FLOOR_Y + 50;
Game.SUN_Z = -70;
Game.FLOOR_WIDTH = 512;
Game.FLOOR_LENGTH = 512;

function Game(character, obstacles, extras, sun, clouds, floorTexture, pterodactyls){
	game = this;
	this.elements = {
		character : new Character({mesh: character}),
		obstacles : obstacles,
		scene: null,
		camera: null,
		renderer: null,
		lights: [],
		extras: extras,
		shadowLight: null,
		sun: sun,
		clouds: clouds,
		floorTexture: floorTexture,
		floorPlanes: [],
		pterodactyls: pterodactyls
	};
	this.clock = new THREE.Clock(false);
	this.jumpClock = new THREE.Clock(false);
}

Game.prototype.start = function(){
		this.initialize();
		GameUtils.startGame();
	};

Game.prototype.initialize = function(){
	this.createScene();
}

Game.prototype.createScene = function(){
	this.elements.scene = new THREE.Scene();
	this.elements.scene.fog = new THREE.Fog("rgb(226, 237, 255)", 1, Game.CAMERA_FAR );

	this.elements.camera = new THREE.PerspectiveCamera(Game.CAMERA_FOV, Game.CAMERA_ASPECT, Game.CAMERA_NEAR, Game.CAMERA_FAR );
	this.elements.camera.wrapper = new CameraWrapper(this);
	this.elements.scene.add(this.elements.camera);
	
	this.elements.renderer = new THREE.WebGLRenderer();
	this.elements.renderer.setSize( window.innerWidth, window.innerHeight);
	this.elements.renderer.setClearColor(this.elements.scene.fog.color);
	this.elements.renderer.shadowMap.enabled = true;
	document.body.appendChild(this.elements.renderer.domElement);

	var floorGeo = new THREE.PlaneGeometry( Game.FLOOR_WIDTH, Game.FLOOR_LENGTH );
	var floorMat = new THREE.MeshLambertMaterial( { map: this.elements.floorTexture });//color: 'rgb(210, 160, 125)'} );
	var floorPlane1 = new THREE.Mesh(floorGeo, floorMat);
	floorPlane1.position.set(0, Game.FLOOR_Y, 0);
	floorPlane1.rotation.x = -Math.PI/2;
	floorPlane1.receiveShadow = true;
	var floorPlane2 = floorPlane1.clone();
	floorPlane2.position.set(0, Game.FLOOR_Y, Game.FLOOR_LENGTH);
	
	this.elements.floorPlanes.push(floorPlane1);
	this.elements.floorPlanes.push(floorPlane2); 
	this.elements.scene.add(floorPlane1); 
	this.elements.scene.add(floorPlane2); 
	
	/*
	var floor = this.elements.floor;
	floor.geometry.computeBoundingBox();
	var floorWidth = Math.abs(floor.geometry.boundingBox.max.x - floor.geometry.boundingBox.min.x);
	var floorHeight = Math.abs(floor.geometry.boundingBox.max.y - floor.geometry.boundingBox.min.y);
	var rows = Game.FLOOR_WIDTH / floorWidth;
	var columns = Game.FLOOR_LENGTH / floorHeight;
	for(var i = 0; i < rows; i++){
		for(var j = 0; j < columns; j ++){
			var floorTile = floor.clone();
			floorTile.position.z = 
			this.elements.floorPlanes[i][j] = floorTile;
		}
	}
	*/
	this.elements.scene.add(new THREE.AmbientLight(0x404040));

	
	var hemiLight = new THREE.HemisphereLight("rgb(226, 237, 255)", 0xffffff, 0.5 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 50, 0 );
	this.elements.lights.push(hemiLight);
	this.elements.scene.add(hemiLight);

	var sunSpotLight = new THREE.SpotLight( 0xffffff, 0.8);
	sunSpotLight.position.set(Game.SUN_X, Game.SUN_Y, Game.SUN_Z);
	sunSpotLight.target.position.set(0, Game.FLOOR_Y, 50);
	sunSpotLight.castShadow = true;
	sunSpotLight.shadowDarkness = 0.7;
	sunSpotLight.shadowCameraNear = 1;
	sunSpotLight.shadowCameraFar = 180;
	sunSpotLight.shadowCameraFov = 50;

	var lightForSun = new THREE.SpotLight(0xffffff, 1);
	lightForSun.position.set(Game.SUN_X - 10, Game.SUN_Y, Game.SUN_Z);
	lightForSun.target.position = sunSpotLight;
	this.elements.lights.push(lightForSun);
	this.elements.lights.push(sunSpotLight);
	this.elements.scene.add(sunSpotLight);
	this.elements.scene.add(sunSpotLight.target);
	this.elements.scene.add(lightForSun);

	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
	dirLight.position.set(0, 1, 0);
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	this.elements.scene.add(dirLight);


	this.elements.character.mesh.castShadow = true;
	this.elements.scene.add(this.elements.character.mesh);
	for(var i = 0; i < this.elements.obstacles.length; i++){
		this.elements.obstacles[i].castShadow = true;
	}

	this.elements.sun.position.set(Game.SUN_X, Game.SUN_Y, Game.SUN_Z);
	this.elements.scene.add(this.elements.sun);

	for(var i = 0; i < this.elements.extras.length; i++){
		this.elements.extras[i].castShadow = true;
		this.elements.scene.add(this.elements.extras[i]);
	}

	for(var i = 0; i < this.elements.clouds.length; i++){
		this.elements.clouds[i].castShadow = true;
		this.elements.clouds[i].position.y = Game.FLOOR_Y + 10;
		this.elements.scene.add(this.elements.clouds[i]);
	}

	for(var i = 0; i < this.elements.pterodactyls.length; i++){
		var animationMixer = new THREE.AnimationMixer(this.elements.pterodactyls[i]);
		var pterodactyl = this.elements.pterodactyls[i];
		for(var j = 0; j < pterodactyl.geometry.animations.length; j++)
			animationMixer.play(new THREE.AnimationAction(pterodactyl.geometry.animations[j]));
		pterodactyl.animationMixer = animationMixer;
	}
}

Game.prototype.updateElements = function(){
	this.updateCharacter();
	this.updateFloor();
	this.updateObstacles();
	this.updateExtras();
	this.updateCamera();
}
var lastObstacleZ = 0;
Game.prototype.updateObstacles = function(){
	if(this.clock.getElapsedTime() < 3.5) return;
	
	var obstacles = this.elements.obstacles;
	if(lastObstacleZ == 0)
		lastObstacleZ = this.elements.character.position.z;
	for(var i = 0; i < obstacles.length; i++){
		var obstacle = obstacles[i];
		obstacle.position.z -= Game.DEFAULT_CHARACTER_SPEED;
		var distance = Math.abs(this.elements.camera.position.x - obstacle.position.x);
		var frustumWidth = GameUtils.calculateFrustumWidth(distance, Game.CAMERA_ASPECT, Game.CAMERA_FOV);
		if(obstacle.position.z < this.elements.camera.position.z - frustumWidth / 2){
			var minZ = lastObstacleZ + Game.MIN_OBSTACLE_DISTANCE;
			minZ = (minZ < this.elements.camera.position.z + frustumWidth / 2) ? this.elements.camera.position.z + frustumWidth / 2 : minZ;
			var z = THREE.Math.randFloat(minZ, minZ + 25);
			obstacle.geometry.computeBoundingBox();
			var obstacleY = Math.abs(obstacle.geometry.boundingBox.max.y - obstacle.geometry.boundingBox.min.y) / 2 + Game.FLOOR_Y
			obstacle.position.set(this.elements.character.position.x, obstacleY, z);
			this.elements.scene.add(obstacle);
		}
		if(obstacle.position.z > lastObstacleZ){
			lastObstacleZ = obstacle.position.z;
		}
	}
	//this.elements.floor.position.z -= Game.DEFAULT_CHARACTER_SPEED;
};

Game.prototype.updateFloor = function(){
	for(var i = 0; i < this.elements.floorPlanes.length; i++){
		var floorPlane = this.elements.floorPlanes[i];
		floorPlane.position.z -= Game.DEFAULT_CHARACTER_SPEED;
		if(floorPlane.position.z < -Game.FLOOR_LENGTH){
			floorPlane.position.z = Game.FLOOR_LENGTH - Game.DEFAULT_CHARACTER_SPEED;
		}
	}
}

Game.prototype.updateCharacter = function(shouldCalculateProjectile){
	var character = this.elements.character;
	if(this.clock.getElapsedTime() == 0){
		character.position.set(0, character.height() / 2 + Game.FLOOR_Y, 0);
		return;
	}

	if(typeof shouldCalculateProjectile === 'undefined'){
		shouldCalculateProjectile = !isCharacterOnGround(character);
	}
	if(shouldCalculateProjectile){
		character.yVelocity = (typeof character.yVelocity === 'undefined') ? Game.DEFAULT_YVELOCITY : character.yVelocity;
		var projectile = GameUtils.calculateProjectile(character.position.y, character.yVelocity, this.jumpClock.getElapsedTime());
		character.position.y = (projectile.dY <  character.height() / 2 + Game.FLOOR_Y) ?  character.height() / 2 + Game.FLOOR_Y : projectile.dY;
		character.yVelocity = (projectile.dY <= character.height() / 2 + Game.FLOOR_Y) ? Game.DEFAULT_YVELOCITY : projectile.dYVelocity;
	}
	//character.position.z += Game.DEFAULT_CHARACTER_SPEED;
	character.animationMixer.update(0.07 );
}

Game.prototype.updateCamera = function(){
	var time = this.clock.getElapsedTime();
	if(time == 0){
		this.elements.camera.rotation.y = -Math.PI/2;
	}
	if(time < 1){
		this.elements.camera.wrapper.focusHead();
	}
	else if(time >= 1 && time <= 2){
		this.elements.camera.wrapper.focusHead();
	} else if(time > 2){
		this.elements.camera.wrapper.focusWhole(time);
	}
}

Game.prototype.updatePterodactyls = function(){
	var pterodactyls = this.elements.pterodactyls;
	for(var i = 0; i < pterodactyls.length; i++){
		var pterodactyl = pterodactyls[i];
		pterodactyl.animationMixer.update(0.05);
		pterodactyl.position.x += Game.DEFAULT_CHARACTER_SPEED * 2;
		//var distance = Math.abs(this.elements.camera.position.x - cloud.position.x);
		//var frustumWidth = GameUtils.calculateFrustumWidth(distance, Game.CAMERA_ASPECT, Game.CAMERA_FOV);
		if(pterodactyl.position.x > Game.CAMERA_FAR || this.clock.getElapsedTime() == 0){
			var minZ = this.elements.camera.position.z - 50;
			var z = THREE.Math.randFloat(minZ, minZ + 300);
			var x = THREE.Math.randFloat(this.elements.camera.position.x - 5, -Game.CAMERA_FAR);
			var y = THREE.Math.randFloat(Game.FLOOR_Y + 15, Game.FLOOR_Y + 40);
			pterodactyl.position.set(x, y, z);
			this.elements.scene.add(pterodactyl);
		}
	}
}

Game.prototype.updateClouds = function(){
	
	var clouds = this.elements.clouds;
	for(var i = 0; i < clouds.length; i++){
		var cloud = clouds[i];
		cloud.position.z -= Game.DEFAULT_CHARACTER_SPEED * 0.25;
		var distance = Math.abs(this.elements.camera.position.x - cloud.position.x);
		var frustumWidth = GameUtils.calculateFrustumWidth(distance, Game.CAMERA_ASPECT, Game.CAMERA_FOV);
		if(cloud.position.z < this.elements.character.position.z - frustumWidth){
			var minZ = this.elements.camera.position.z + frustumWidth / 2;
			var z = THREE.Math.randFloat(minZ, minZ + 100);
			var x = THREE.Math.randFloat(this.elements.character.position.x + 50, Game.SUN_X - 25);
			var y = THREE.Math.randFloat(Game.FLOOR_Y + 15, Game.FLOOR_Y + 40);
			cloud.position.set(x, y, z);
		}
	}
}

Game.prototype.updateExtras = function(){
	this.updateClouds();
	this.updatePterodactyls();
	var extras = this.elements.extras;
	for(var i = 0; i < extras.length; i++){
		var extra = extras[i];
		extra.position.z -= Game.DEFAULT_CHARACTER_SPEED;
		var distance = Math.abs(this.elements.camera.position.x - extra.position.x);
		var frustumWidth = GameUtils.calculateFrustumWidth(distance, Game.CAMERA_ASPECT, Game.CAMERA_FOV);
		if(extra.position.z < this.elements.character.position.z - frustumWidth){
			var minZ = this.elements.camera.position.z + frustumWidth / 2;
			var z = THREE.Math.randFloat(minZ, minZ + 200);
			var x = THREE.Math.randFloat(this.elements.character.position.x - 20, this.elements.character.position.x + 20);
			extra.geometry.computeBoundingBox();
			var y = Math.abs(extra.geometry.boundingBox.max.y - extra.geometry.boundingBox.min.y) + Game.FLOOR_Y;
			extra.position.set(x, y, z);
		}
	}
	this.elements.sun.rotation.x += 0.005;
}

Game.prototype.update = function(){
	this.updateElements();
	if(this.clock.getElapsedTime() < 3.5)
		return true;
	Game.OVER = this.elements.character.intersectsObjects(this.elements.obstacles);
	if(!Game.OVER){
		currentScore += Game.DEFAULT_CHARACTER_SPEED * 0.25;
		GameUtils.updateScore(Math.round(currentScore));
		return true;
	}
	GameUtils.endGame();
	return false;
}

function CameraWrapper(game){
	this.game = game;

	//this.focusFeet = function(){
	//	game.elements.camera.position.set(game.elements.character.position.x - 3, Game.FLOOR_Y + 2, game.elements.character.position.z + 2);

	//}

	this.focusHead = function(){
		game.elements.camera.position.set(game.elements.character.position.x - 6, 
			Game.FLOOR_Y + game.elements.character.height() - 0.5, 
			game.elements.character.position.z + 5);
	}

	this.focusWhole = function(time){
		var maxZoomOut = game.elements.character.position.x - Game.CAMERA_ZOOM_OUT;
		var cameraZoomOut = (game.elements.camera.position.x - 0.2 < maxZoomOut) ? maxZoomOut : game.elements.camera.position.x - 0.5;
		
		var cameraElevation = (game.elements.camera.position.y + 0.1 < Game.FLOOR_Y + Game.CAMERA_ELEVATION) ? 
			game.elements.camera.position.y + 0.1 : Game.FLOOR_Y + Game.CAMERA_ELEVATION;
		
		var maxCameraAdvance = game.elements.character.position.z + Game.CAMERA_ADVANCE;
		var cameraAdvance = (game.elements.camera.position.z + Game.DEFAULT_CHARACTER_SPEED + 0.075 > maxCameraAdvance) ? 
			maxCameraAdvance : game.elements.camera.position.z + Game.DEFAULT_CHARACTER_SPEED + 0.075;
		
		var fov = game.elements.camera.fov + 2;
		game.elements.camera.fov = fov;

		game.elements.camera.position.set(cameraZoomOut, cameraElevation, cameraAdvance);
		game.elements.camera.lookAt(new THREE.Vector3(game.elements.character.position.x, game.elements.camera.position.y, game.elements.camera.position.z));
	}
}

function render(){
	if(game.update()){
		requestAnimationFrame(render);
		game.elements.renderer.render(game.elements.scene, game.elements.camera);
	}
}

window.addEventListener("keypress", onKeyPress);

function onKeyPress(event){
	if(event.charCode == Game.JUMP_KEY){
		if(isCharacterOnGround(game.elements.character)){
			game.jumpClock = new THREE.Clock(true);
			game.updateCharacter(game.elements.character, true);
		}
	}
}

function isCharacterOnGround(character){
	return character.position.y == character.height() / 2 + Game.FLOOR_Y;
}

function replay(){
	document.getElementById("gameOverHud").style.display = "none";
	GameUtils.startGame();
}