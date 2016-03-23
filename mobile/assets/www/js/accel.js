var lastX,lastY,lastZ;
var moveCounter = 0;
var sensitivity = 4;
/**
 * updateAcceleration() - Code pour l'accelerometer
 */ 			
function updateAcceleration(a) {
	if(!lastX) {
		lastX = a.x;
		lastY = a.y;
		lastZ = a.z;
		return;
	}

	var deltaX, deltaY, deltaZ;
	deltaX = Math.abs(a.x-lastX);
	deltaY = Math.abs(a.y-lastY);
	deltaZ = Math.abs(a.z-lastZ);

	if(deltaX + deltaY + deltaZ > 3) {
		moveCounter++;
	} else {
		moveCounter = Math.max(0, --moveCounter);
	}

	if(deltaX !=0 || deltaY != 0 || deltaZ != 0) console.log(deltaX,deltaY,deltaZ,moveCounter);

	if(moveCounter > 1) { start(); moveCounter=0; }

	lastX = a.x;
	lastY = a.y;
	lastZ = a.z;
}

/**
 * startWatch() - initialisation de l'accelerometre
 */ 		
var watchID;
function startWatch() {
  var previousReading = {
    x: null,
    y: null,
    z: null
  }
  var options = { frequency: 250 };  // Update acceleration every quarter second
  watchID = navigator.accelerometer.watchAcceleration(function onSuccess(acceleration) {
    var changes = {};
//    bound = 4;  // this controls the sensitivity for detecting the shake event
    if (previousReading.x !== null) {
      changes.x = Math.abs(previousReading.x, acceleration.x);
      changes.y = Math.abs(previousReading.y, acceleration.y);
    }
    if (changes.x > sensitivity && changes.y > sensitivity) {
      // We are relying on a hidden button with an ID of shake to be present on the Profound UI Rich Display File screen
      lose();
    }
    previousReading = {
      x: acceleration.x,
      y: acceleration.y,
      z: acceleration.z
    }
  }, function onError() {
    alert('Some problem has occurred in reading the accelerometer.');
  }, options);
}
 
/**
 * stopWatch() - arret de l'accelerometre
 */  
function stopWatch() {
  if (watchID) {
    navigator.accelerometer.clearWatch(watchID);
    watchID = null;
  }
}
