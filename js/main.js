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



var globeParticles  = new THREE.Geometry();
var globeMaterial   = new THREE.ParticleBasicMaterial({
                            color:        0xfafafa,
                            size:         5,
                            map:          THREE.ImageUtils.loadTexture("images/particle.png"),
                            blending:     THREE.AdditiveBlending,
                            transparent:  true
                          });

var citiesParticles = new THREE.Geometry();
var citiesMaterial  = new THREE.ParticleBasicMaterial({
                            color:        0xff0000,
                            size:         100,
                            map:          THREE.ImageUtils.loadTexture("images/particle.png"),
                            blending:     THREE.AdditiveBlending,
                            transparent:  true
                          }); 

var coastParticles  = new THREE.Geometry();
var coastMaterial   = new THREE.ParticleBasicMaterial({
                            color:        0xff0000,
                            size:         10,
                            map:          THREE.ImageUtils.loadTexture("images/particle.png"),
                            blending:     THREE.AdditiveBlending,
                            transparent:  true
                          });

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


$(function() {
// Create particles for the globe
var particleCount = parseFloat(100);

for ( var q = -particleCount; q < particleCount; q++ ) {

  var limit = Math.sin( Math.abs(q/particleCount) * Math.PI ) * particleCount;

  for(var p = -limit; p < limit; p++) {
    var phi = p/limit * Math.PI;
    var theta = q/particleCount * Math.PI;
    var rho = 1;
    
    theta += Math.random()/particleCount;
    rho += Math.random()/50;

    var xyz = convert.toCartesian([rho, theta, phi]);
    var particle = getParticle(xyz);
    globeParticles.vertices.push(particle);
  }
}

// Create particles for cities!
for ( var i in cities ) {
  var particle = getParticle(convert.geoToCartesian(cities[i]));
  particle.color = new THREE.Color(0xff0000);
  citiesParticles.vertices.push(particle);
 }

// Create particles for coastline
var process = function(coordinates) {
  for (var i = 0; i < coordinates.length; i++) {
    var longitude = coordinates[i][0];
    var latitude = coordinates[i][1];
    var height = 1;
    var particle = getParticle(convert.geoToCartesian([height, longitude, latitude]));
    coastParticles.vertices.push(particle);
  }
};

var features = coastlines.features;
for (var i = 0; i < features.length; i++ ) {
  process(features[i]['geometry']['coordinates']);
}




// *** Create particle systems ***
var globeParticleSystem = new THREE.ParticleSystem(
  globeParticles,
  globeMaterial);

var citiesParticleSystem = new THREE.ParticleSystem(
  citiesParticles,
  citiesMaterial);

var coastParticleSystem = new THREE.ParticleSystem(
  coastParticles,
  coastMaterial);
  
// add it to the scene
scene.addChild(globeParticleSystem);
scene.addChild(citiesParticleSystem);
scene.addChild(coastParticleSystem);


  
  // animation loop
function update() {
  
  // add some rotation to the system
  globeParticleSystem.rotation.y += 0.005;
  citiesParticleSystem.rotation.y += 0.005;
  coastParticleSystem.rotation.y += 0.005;

  
  /* flag to the particle system that we've
  changed its vertices. This is the
  dirty little secret. */
  globeParticleSystem.geometry.__dirtyVertices = true;
  citiesParticleSystem.geometry.__dirtyVertices = true;
  coastParticleSystem.geometry.__dirtyVertices = true;
  
  renderer.render(scene, camera);
  
  // set up the next call
  requestAnimFrame(update);
};
  
requestAnimFrame(update);
});