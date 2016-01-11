function Character(properties){

	if(typeof properties.mesh === 'undefined') throw "TypeError: Invalid character: mesh is undefined";
	this.mesh = properties.mesh;

	this.animationMixer = new THREE.AnimationMixer(properties.mesh);
	this.raycaster = new THREE.Raycaster();

	var animations = properties.mesh.geometry.animations;
	if(typeof animations !== 'undefined'){
		for(var i = 0; i < animations.length; i++){
			this.animationMixer.play(new THREE.AnimationAction(animations[i]));
		}
	}

	this.intersectsObjects = function(objects){

		var rays = [
			new THREE.Vector3(0, 0, 1),
			new THREE.Vector3(0, 0, -1),
			new THREE.Vector3(0, 1, 0),
			new THREE.Vector3(0, -1, 0),
			new THREE.Vector3(0, 1, 1),
			new THREE.Vector3(0, -1, 1),
			new THREE.Vector3(0, 1, -1),
			new THREE.Vector3(0, -1, -1)
		];

		for(var h = 0; h < objects.length; h++){
			objects[h].geometry.computeBoundingBox();
			var boundingBox = objects[h].geometry.boundingBox;
			var characterBoundingBox = this.mesh.geometry.boundingBox;
			if(Math.abs(this.mesh.position.z - objects[h].position.z) < 10){
				console.log('checkig');
				var boundaries = [
					boundingBox.max.z,
					boundingBox.max.z,
					boundingBox.max.y,
					boundingBox.max.y,
					Math.sqrt(Math.pow(boundingBox.max.y, 2) + Math.pow(boundingBox.max.z, 2)),
					Math.sqrt(Math.pow(boundingBox.max.y, 2) + Math.pow(boundingBox.max.z, 2)),
					Math.sqrt(Math.pow(boundingBox.max.y, 2) + Math.pow(boundingBox.max.z, 2)),
					Math.sqrt(Math.pow(boundingBox.max.y, 2) + Math.pow(boundingBox.max.z, 2))
				];

				for(var i = 0; i < rays.length; i++){
					this.raycaster.set(objects[h].position, rays[i]);
					var intersections = this.raycaster.intersectObject(this.mesh);
					if(intersections.length > 0 && intersections[0].distance <= boundaries[i]){
						return true;
					}
				}
			}
		}
		return false;
	}

	this.position = this.mesh.position;


	this.height = function(){
		this.mesh.geometry.computeBoundingBox();
		return Math.abs(this.mesh.geometry.boundingBox.max.y - this.mesh.geometry.boundingBox.min.y);
	};
}