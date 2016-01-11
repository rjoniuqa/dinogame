var gm;
var ACCELERATION = -0.05;
var DEFAULT_YVELOCITY = 0.75;
var FLOOR_Y = 0;
var JUMP_KEY = 32;
var NUM_TREES = 100;
var CAMERA_ZOOM_OUT = 50;
var CAMERA_ELEVATION = 15;
var CAMERA_ADVANCE = 10;
var DEFAULT_CHARACTER_SPEED = 0.5;
var MIN_OBSTACLE_DISTANCE = 15;
var obstaclesForRepositioning = [];

function GameManager(character, obstacles, backgroundExtras){
	this.modelLoader = new ModelLoader();
	this.character = character;
	this.obstacles = obstacles;
	this.backgroundExtras = backgroundExtras;
	this.models = {
		character : null,
		obstacles : [],
		backgroundExtras: []
	};
	this.nearestObstacle;
	this.scene;
	this.camera;
	this.renderer;
	this.animationMixers = [];
	this.clock = new THREE.Clock(false);
	gm = this;
}

GameManager.prototype.addToScene = function(mesh){
	this.scene.add(mesh);
}

GameManager.prototype.startGame = function(){
	this.initialize();
}

GameManager.prototype.initialize = function(){
	this.createScene();
	this.loadModels();
	var interval = setInterval(function(){
		if(areModelsLoaded()){
			gm.clock.start();
			resetInitialPosition();
			render();
			clearInterval(interval);
		}
	}, 100);
}

GameManager.prototype.addObstacle = function(obstacle){
	//for(var i = 0; i < 10; i++){
	//	this.models.obstacles.push(obstacle.clone());
	//	this.addToScene(obstacle.clone());
	//}
	var geometry = new THREE.BoxGeometry( 5, 5, 2 );
	var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = -50;
	this.obstacles.push(mesh);
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = -50;
	this.addToScene( mesh );
	this.models.obstacles.push(mesh);
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = -50;
	this.addToScene( mesh );
	this.models.obstacles.push(mesh);
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = -50;
	this.addToScene( mesh );
	this.models.obstacles.push(mesh);
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = -50;
	this.addToScene( mesh );
	this.models.obstacles.push(mesh);
}

GameManager.prototype.addBackgroundExtra = function(backgroundExtra){
	backgroundExtra.geometry.computeBoundingBox();
	var floorY = Math.abs(backgroundExtra.geometry.boundingBox.min.y) + FLOOR_Y
	for(var i = 0; i < NUM_TREES; i++){
		var tree = backgroundExtra.clone();
		tree.floorY = floorY;
		this.models.backgroundExtras.push(tree);
		//this.addToScene(tree);
	}
}

GameManager.prototype.setCharacter = function(character){
	this.models.character = new Character({mesh: character, floorY: FLOOR_Y});
	this.addToScene(this.models.character.mesh);
}

GameManager.prototype.loadModels = function(){
	//load the models
	for(var i = 0; i < this.obstacles.length; i++){
		this.modelLoader.loadBasicModel(this.obstacles[i], this.addObstacle);
	}

	for(var i = 0; i < this.backgroundExtras.length; i++){
		this.modelLoader.loadBasicModel(this.backgroundExtras[i], this.addBackgroundExtra);
	}

	this.modelLoader.loadAnimatingModel(this.character, this.setCharacter);
}

GameManager.prototype.createScene = function(){
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.Fog("rgb(226, 237, 255)", 1, 5000 );

	this.camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 5000 );
	this.camera.position.set( 0, 15, 50);
	var cameraHelper = new THREE.CameraHelper(this.camera);

	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.renderer.setClearColor(this.scene.fog.color);
	document.body.appendChild(this.renderer.domElement);

	// GROUND

	var groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
	var groundMat = new THREE.MeshLambertMaterial( { color: 'rgb(210, 160, 125)'} );

	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	ground.position.y = 0;
	this.scene.add( ground );

	ground.receiveShadow = true;


	var pointLight = new THREE.PointLight( 0xffffff, 1, 0 );
	pointLight.position.set( 0, 100, 0 );
	
	var hemiLight = new THREE.HemisphereLight("rgb(226, 237, 255)", 0xffffff, 0.5 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 50, 0 );
	
	var dirLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.position.set(0, 1, 0);


//	this.scene.add(pointLight);
	this.scene.add(hemiLight);
	this.scene.add(dirLight);

	this.scene.add(this.camera);
}

function areModelsLoaded(){
	if(!gm.models.character){
		return false;
	}
//	if(gm.models.obstacles.length != gm.obstacles.length){
//		return false;
//	}
	return true;
}


GameManager.prototype.updateModelLocations = function(){
	this.models.character.position.z += 1;
}

function render(){
	requestAnimationFrame(render);
	gm.updateModelLocations();
	gm.camera.lookAt(gm.models.character.position);
	gm.renderer.render(gm.scene, gm.camera);
}


function resetInitialPosition(){
	positionTreesRandomly(gm.models.backgroundExtras);
	gm.models.character.position.set(0, gm.models.character.floorY, 0);
	gm.camera.rotation.y = -Math.PI/2;
	focusHead();
	updateObstaclePositions();
}

function focusFeet(){
	gm.camera.position.set(gm.models.character.position.x - 6, 1, gm.models.character.position.z + 2);
}


function focusHead(){
	gm.camera.position.set(gm.models.character.position.x - 6, gm.models.character.height() - 0.5, gm.models.character.position.z +  5);
}

function focusWhole(time){
	var maxZoomOut = gm.models.character.position.x - CAMERA_ZOOM_OUT;
	var cameraZoomOut = (gm.camera.position.x - 0.2 < maxZoomOut) ? maxZoomOut : gm.camera.position.x - 0.5;
	
	var cameraElevation = (gm.camera.position.y + 0.1 < CAMERA_ELEVATION) ? gm.camera.position.y + 0.1 : CAMERA_ELEVATION;
	
	var maxCameraAdvance = gm.models.character.position.z + CAMERA_ADVANCE;
	var cameraAdvance = (gm.camera.position.z + DEFAULT_CHARACTER_SPEED + 0.075 > maxCameraAdvance) ? maxCameraAdvance : gm.camera.position.z + DEFAULT_CHARACTER_SPEED + 0.075;
	
	gm.camera.position.set(cameraZoomOut, cameraElevation, cameraAdvance);
	gm.camera.lookAt(new THREE.Vector3(gm.models.character.position.x, FLOOR_Y + 3, gm.camera.position.z));
}

var gameOver = false;
var placeObstacles = false;
function render(){
	if(!gameOver){
	requestAnimationFrame(render);
	var time = gm.clock.getElapsedTime();
	updateCameraPosition(gm.camera, time);
	updateCharacterPosition(gm.models.character);
	if(placeObstacles)
		updateObstaclePositions();
	spawnTrees();
	gameOver = gm.models.character.intersectsObjects(gm.models.obstacles);
	gm.renderer.render(gm.scene, gm.camera);
	}
}

function updateCameraPosition(camera, time){
	if(time < 1){
		focusFeet();
	}
	else if(time >= 1 && time <= 2){
		focusHead();
	} else if(time > 2){
		focusWhole(time);
		placeObstacles = true;
	}
}

function updateCharacterPosition(character, shouldCalculateProjectile){
	if(typeof shouldCalculateProjectile === 'undefined'){
		shouldCalculateProjectile = !isCharacterOnGround(character);
	}
	if(shouldCalculateProjectile){
		character.yVelocity = (typeof character.yVelocity === 'undefined') ? DEFAULT_YVELOCITY : character.yVelocity;
		var projectile = calculateProjectile(character.position.y, character.yVelocity, jumpClock.getElapsedTime());
		character.position.y = (projectile.dY <  character.floorY) ?  character.floorY : projectile.dY;
		character.yVelocity = (projectile.dY <= character.floorY) ? DEFAULT_YVELOCITY : projectile.dYVelocity;
	}
	character.position.z += DEFAULT_CHARACTER_SPEED;
	character.animationMixer.update(0.05);
}

function calculateProjectile(y, yVelocity, time){
	time = (time < 1) ? 1 : time;
	yVelocity = (!yVelocity) ? DEFAULT_YVELOCITY : yVelocity;
	var dY = y + (yVelocity * time + 0.5 * ACCELERATION * Math.pow(time, 2));
	var dYVelocity = yVelocity + ACCELERATION * time;
	return {dY: dY, dYVelocity: dYVelocity};
}

window.addEventListener("keypress", onKeyPress);
var jumpClock;

function onKeyPress(event){
	if(event.charCode == JUMP_KEY){
		if(isCharacterOnGround(gm.models.character)){
			jumpClock = new THREE.Clock(true);
			updateCharacterPosition(gm.models.character, true);
		}
	}
}

function isCharacterOnGround(character){
	return character.position.y == character.floorY;
}


function updateObstaclePositions(){


	var obstacles = gm.models.obstacles;
	var hasObstaclesForRepositioning = true;
	var i = 0;
	while(hasObstaclesForRepositioning && i < obstacles.length){
		if(obstacles[i].position.z < gm.models.character.position.z - 50){
			obstaclesForRepositioning.push(obstacles.shift());
		} else hasObstaclesForRepositioning = false;
		i++;
	}
	console.log(i);

	while(obstaclesForRepositioning.length > 0){
		var nextObstacle = obstaclesForRepositioning.pop();
		var lastObstacle = obstacles[obstacles.length - 1];	
		var z = THREE.Math.randFloat(lastObstacle.position.z + MIN_OBSTACLE_DISTANCE, lastObstacle.position.z + 50);
		z = z < gm.models.character.z ? gm.models.character.z + 50 : z;
		nextObstacle.position.set(gm.models.character.position.x, 0, z);
		obstacles.push(nextObstacle);
	}
}

function spawnTrees(){
	var frustum = new THREE.Frustum();
	var cameraViewProjectionMatrix = new THREE.Matrix4();

	// every time the camera or objects change position (or every frame)

	gm.camera.updateMatrixWorld(); // make sure the camera matrix is updated
	gm.camera.matrixWorldInverse.getInverse( gm.camera.matrixWorld );
	cameraViewProjectionMatrix.multiplyMatrices( gm.camera.projectionMatrix, gm.camera.matrixWorldInverse );
	frustum.setFromMatrix(cameraViewProjectionMatrix);

	var trees = gm.models.backgroundExtras;
	var clippedOutFromBehindTrees = [];
	for(var i = 0; i < trees.length; i++){
		if(trees[i].position.z < gm.camera.position.z && !frustum.intersectsObject(trees[i])){
			clippedOutFromBehindTrees.push(trees[i]);
		}
	}
	positionTreesRandomly(clippedOutFromBehindTrees, gm.models.character.position.z + 250);

}

function positionTreesRandomly(trees, minZ){
	if(typeof minZ === 'undefined'){
		minZ = gm.models.character.position.z - 50;
	}

	for(var i = 0; i < trees.length; i++){
		var z = THREE.Math.randFloat(minZ + 250, minZ);
		var x = THREE.Math.randFloat(gm.models.character.position.x + 20, gm.models.character.position.x + 100);
		var yRotation = THREE.Math.randFloat(0, Math.PI * 2);
		trees[i].position.set(x, trees[i].floorY, z);
		trees[i].rotation.y = yRotation;
	}
}