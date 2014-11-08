
  // @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
  // set the scene size
  var WIDTH = innerWidth,
      HEIGHT = innerHeight;
  
  // set some camera attributes
  var VIEW_ANGLE = 35,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;
  
  // get the DOM element to attach to
  // - assume we've got jQuery to hand
  var $container = $('#container');
  
  // create a WebGL renderer, camera
  // and a scene
  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.Camera(  VIEW_ANGLE,
                                  ASPECT,
                                  NEAR,
                                  FAR  );
  var scene = new THREE.Scene();
  
  // the camera starts at 0,0,0 so pull it back
  camera.position.z = 850;
  
  // start the renderer - set the clear colour
  // to a full black
  renderer.setClearColor(new THREE.Color(0x111111));
  renderer.setSize(WIDTH, HEIGHT);
  
  // attach the render-supplied DOM element
  $container.append(renderer.domElement);
  
  // create the particle variables
  var particleCount = 60,
      particles = new THREE.Geometry(),
      citiesParticles = new THREE.Geometry(),
      globeMaterial = new THREE.ParticleBasicMaterial({
        color: 0xfafafa,
        size: 5,
        map: THREE.ImageUtils.loadTexture(
          "images/particle.png"
        ),
        blending: THREE.AdditiveBlending,
        transparent: true
      }),
      citiesMaterial = new THREE.ParticleBasicMaterial({
        color: 0xFF0000,
        size: 10,
        blending: THREE.AdditiveBlending,
        transparent: true,
        map: THREE.ImageUtils.loadTexture(
          "images/particle.png")
      });

  // var nyc = [40.7056308,-73.9780035];
  // var van = [49.2569777,-123.123904];
  // var bsas = [-34.6158527,-58.4332985];
  // var santiago = [-33.6682982,-70.363372];
  // var london = [51.5286416,-0.1015987];
  // var capetown = [-33.9149861,18.6560594];


  $.getJSON("ne_110m_coastline.geojson", function(json) {
    
    var features = json.features;
    var coords = [];
    for (var i = 0; i < features.length; i++ ) {

      var feature = features[i];
      coords = coords.concat(feature.geometry.coordinates);
      // debugger;
    }
    console.log(coords.length);
    generateCoast(coords);
  });

  var toCartesian = function(theta, phi) {
    return [ Math.cos(theta) * Math.sin(phi),
             Math.sin(theta) * Math.sin(phi),
             Math.cos(phi)];
  }

  var lngLatToSpherical= function(longitude, latitude) {
    var theta = Math.PI * (0.5 - (longitude / 180.0));
    var phi = Math.PI * (0.5 - (latitude / 180.0));
    return  [theta, phi];
  }

  var getParticle = function(coord) {
    size = 100;
    particle = new THREE.Vertex(
      new THREE.Vector3(
        coord[0] * size, 
        coord[2] * size,
        coord[1] * size
      )
    );
    // add it to the geometry
    return particle;
  }

  var f_total = parseFloat(particleCount);
  
  // now create the individual particles
  // for(var p = -particleCount; p < particleCount; p++) {
  //   for (var q = -particleCount; q < particleCount; q++) {
      
  //     var theta = (parseFloat(p) / f_total) * Math.PI;
  //     var phi = (parseFloat(q) / f_total) * Math.PI;

  //     var xyzCoord = toCartesian(theta, phi);
  //     var particle = getParticle(xyzCoord);
  //     particles.vertices.push(particle);
  //   }
  // }

  var mapCity = function(lngLat) {
    var longitude = lngLat[0];
    var latitude = lngLat[1];
    var spherical = lngLatToSpherical(lngLat[0], lngLat[1]);
    var xyz = toCartesian(spherical[0], spherical[1]);
    var particle = getParticle(xyz);
    particle.color = new THREE.Color( 0xff0000 );
    citiesParticles.vertices.push(particle);
    
  }

  
  var generateCoast = function (coords) {
    for (var i = 0; i < coords.length; i++) {
      mapCity(coords[i]);
    }
    scene.addChild(citiesParticleSystem);
  }
  
  // generateCoast();
  // mapCity(van);
  // mapCity(santiago);
  // mapCity(bsas);
   // mapCity(nyc);
  // mapCity(capetown);
  // mapCity(london);
  
  // create the particle system
  var globeParticleSystem = new THREE.ParticleSystem(
    particles,
    globeMaterial);
  
  var citiesParticleSystem = new THREE.ParticleSystem(
    citiesParticles,
    citiesMaterial);
    

  //particleSystem.sortParticles = true;
  
  // add it to the scene
  scene.addChild(globeParticleSystem);

  
  // animation loop
  function update() {
    
    // add some rotation to the system
    globeParticleSystem.rotation.y += 0.005;
    citiesParticleSystem.rotation.y += 0.005;

    var pCount = particleCount;
    while(pCount--) {
      // get the particle
      var particle = particles.vertices[pCount];
    }
    
    // flag to the particle system that we've
    // changed its vertices. This is the
    // dirty little secret.
    globeParticleSystem.geometry.__dirtyVertices = true;
    citiesParticleSystem.geometry.__dirtyVertices = true;
    
    renderer.render(scene, camera);
    
    // set up the next call
    requestAnimFrame(update);
  }
  requestAnimFrame(update);
