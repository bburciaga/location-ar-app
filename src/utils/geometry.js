
export { calculateDistance }

function calculateDistance(coord1, coord2) {
  const RADIUS_OF_EARTH = 6371000; // meters
  const dLat = degToRad(coord2.lat - coord1.lat);
  const dLon = degToRad(coord2.lng - coord1.lng);

  const a = Math.sin(dLat / 2)** 2 + Math.cos(degToRad(coord1.lat))
    * Math.cos(degToRad(coord2.lat)) * Math.sin(dLon / 2) ** 2;
 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RADIUS_OF_EARTH * c;
}

function degToRad(deg) {
  return deg * (Math.PI / 180);
}
