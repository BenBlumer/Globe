convert = {

  // takes spherical coordinates[rho, theta, phi] and converts to Cartesian[x,y,z]
  toCartesian: function(coords) {
    var rho = coords[0];
    var theta = coords[1];
    var phi = coords[2];
    //  console.log(rho + " " + theta + " " + phi);

    var x = rho * Math.sin(theta) * Math.cos(phi); 
    var y = rho * Math.sin(theta) * Math.sin(phi); 
    var z = rho * Math.cos(theta);                
    return [x, y, z];
  },

  // takes geodesic coordinates[height, longitude, latitude] and converts to spherical[rho, theta, phi]
  toSpherical: function(coords) {
    var height = coords[0];
    var longitude = coords[1];
    var latitude = coords[2];

    var rho = coords[0];
    var theta = Math.PI * (-1*latitude / 180.0);
    var phi = Math.PI * (0.5 - (longitude / 180.0));
    return [rho, theta, phi];
  },

  // takes geodesic coordinates[height, longitude, latitude] and converts to Cartesian[x,y,z]
  geoToCartesian: function(coords) {
    return convert.toCartesian(convert.toSpherical(coords));
  }
}