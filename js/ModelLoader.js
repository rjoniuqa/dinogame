
function ModelLoader(gameManager){
	this.gameManager = gameManager;
	this.loader = new THREE.JSONLoader();
}


ModelLoader.prototype.loadAnimatingModel = function(url, onLoad){

	this.loader.load(url, function(geometry, materials) {
		var mesh = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
		var materials = mesh.material.materials;
		for(var i = 0; i < materials.length; i++){
			materials[i].skinning = true;
		}
		onLoad.call(this.gameManager, mesh);
	});
}

ModelLoader.prototype.loadBasicModel = function(url, onLoad){

	this.loader.load(url, function(geometry, materials) {
		var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
		onLoad.call(this.gameManager, mesh);
	});
}

/*

animationMixer = new THREE.AnimationMixer(mesh);
		var animationAction = new THREE.AnimationAction(geometry.animations[0]);
		animationMixer.play(animationAction);
		*/