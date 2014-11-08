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

//***** PARTICLE MAGIC *********
//******************************

// Set-up layers and material
layers = {
  sphere: {
    material:  new THREE.ParticleBasicMaterial({
                    color:        0xfafafa,
                    size:         5,
                    map:          THREE.ImageUtils.loadTexture("images/particle.png"),
                    blending:     THREE.AdditiveBlending,
                    transparent:  true
                  }),
  },

  coastlines: {
    material: new THREE.ParticleBasicMaterial({
                    color:        0xff0000,
                    size:         10,
                    map:          THREE.ImageUtils.loadTexture("images/particle.png"),
                    blending:     THREE.AdditiveBlending,
                    transparent:  true
                  }),
  },

  cities: {
    material: new THREE.ParticleBasicMaterial({
                    color:        0xff0000,
                    size:         50,
                    map:          THREE.ImageUtils.loadTexture("images/particle.png"),
                    blending:     THREE.AdditiveBlending,
                    transparent:  true
                  }),
  },
}

// Give each layer a collection of particles
for (var i in layers) {
  layers[i].particles = new THREE.Geometry();
}


// Helper function. Takes coord[x, y, z] and spits out a vector for particle
var getParticle = function(coord) {
  var size = 200;
  var particle = new THREE.Vertex(
    new THREE.Vector3(
      coord[1] * size, 
      coord[0] * size,
      coord[2] * size
    )
  );
  return particle;
}


// Create particles for the globe
var particleCount = parseFloat(500);

for ( var q = -particleCount; q < particleCount; q++ ) {

  var limit = Math.sin( Math.abs(q/particleCount) * Math.PI ) * particleCount;

  for(var p = -limit; p < limit; p++) {
    var phi = p/limit * Math.PI;
    var theta = q/particleCount * Math.PI;
    var rho = 1;
    
    // theta += Math.random()/particleCount;
    // rho += Math.random()/50;

    var xyz = convert.toCartesian([rho, theta, phi]);
    var particle = getParticle(xyz);
    layers.sphere.particles.vertices.push(particle);
  }
}

// Create particles for cities!
for ( var i in cities ) {
  var particle = getParticle(convert.geoToCartesian(cities[i]));
  particle.color = new THREE.Color(0xff0000);
  layers.cities.particles.vertices.push(particle);
 }

// Create particles for coastline
var process = function(coordinates) {
  for (var i = 0; i < coordinates.length; i++) {
    var longitude = coordinates[i][0];
    var latitude = coordinates[i][1];
    var height = 1;
    var particle = getParticle(convert.geoToCartesian([height, longitude, latitude]));
    layers.coastlines.particles.vertices.push(particle);
  }
};

var features = coastlines.features;
for (var i = 0; i < features.length; i++ ) {
  process(features[i]['geometry']['coordinates']);
}




// *** Create particle systems ***
for (var i in layers) {
  layers[i].system = new THREE.ParticleSystem(
                            layers[i].particles,
                            layers[i].material);
 }

// Add particle systems to the scene 
for (var i in layers) {
  scene.addChild(layers[i].system);
 }

  
// animation loop
function update() {
  
  for (var i in layers) {
    var system = layers[i].system; // changes to `system` will apply to each ParticleSystem

    system.rotation.y += 0.005; // add some rotation to the system

    /* flag to the particle system that we've
      changed its vertices. This is the
      dirty little secret. */
    system.geometry.__dirtyVertices = true;
  };
  
  renderer.render(scene, camera);
  requestAnimFrame(update);   // set up the next call
};
  
requestAnimFrame(update);
