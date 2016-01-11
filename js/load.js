function load(onLoad){

	//load character
	var character;
	var backgroundMesh;
	var obstacles = [];
	var extras = [];
	var loader = new THREE.JSONLoader();
	var pterodactyls = [];
	loader.load('./models/velociraptor.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[i].skinning = true;
			materials[ i ].shading = THREE.FlatShading;
		}
		character = centerMesh(new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials)));
	});

	loader.load('./models/pterodactyl.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[i].skinning = true;
			materials[ i ].shading = THREE.FlatShading;
		}
		pterodactyl = new THREE.SkinnedMesh(geometry, new THREE.MeshFaceMaterial(materials));
		pterodactyl.castShadow = true;
		pterodactyl.rotation.y = -Math.PI/2;
		pterodactyls.push(centerMesh(pterodactyl.clone()));
		pterodactyls.push(centerMesh(pterodactyl.clone()));
		pterodactyls.push(centerMesh(pterodactyl.clone()));
		pterodactyls.push(centerMesh(pterodactyl.clone()));
		pterodactyls.push(centerMesh(pterodactyl.clone()));
	});

	loader.load('./models/cactus.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
	});

	loader.load('./models/camel.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[i].shading = THREE.FlatShading;
		}
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
	});

	loader.load('./models/crate.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		obstacles.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
	});

	loader.load('./models/grass.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		for(var i = 0; i < 50; i++){
			extras.push(centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials))));
		}	
	});

	var clouds = [];
	loader.load('./models/cloud1.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		var cloud = centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)));
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
	});
	loader.load('./models/cloud2.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		var cloud = centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)));
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
	});
	loader.load('./models/cloud3.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		var cloud = centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)));
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
		clouds.push(cloud.clone());
	});

	var sun;
	loader.load('./models/sun.json', function(geometry, materials) {
		for(var i = 0; i < materials.length; i++){
			materials[ i ].shading = THREE.FlatShading;
		}
		sun = centerMesh(new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)));
	});
	var ground;
	new THREE.TextureLoader().load('models/sand-texture.jpg', function(texture){
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.x = 32;
		texture.repeat.y = 32;
		ground = texture;
	});

	function centerMesh(mesh){
		mesh.geometry.center();
		return mesh;
	}

	var interval = setInterval(function(){
		if(pterodactyls && pterodactyls.length == 5 && character && obstacles && obstacles.length == 9 && extras && extras.length == 50 && sun && clouds && clouds.length == 12 && ground){
			clearInterval(interval);
			var geometry = new THREE.BoxGeometry(2,2,2);
			var material = new THREE.MeshBasicMaterial({color: "#ffffff"});
			onLoad(character, obstacles, extras, sun, clouds, ground, pterodactyls);
		}
	}, 100);
}