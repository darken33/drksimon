var start_time;
var stop_time;
var counter;
var chrono_thread;

function startChrono() {
	start_time = (new Date()).getTime();
	chrono_thread = setInterval(tictac, 1000);
}

function stopChrono() {
	if (chrono_thread != null) {
		clearInterval(chrono_thread);
		chrono_thread = null;
		stop_time = (new Date()).getTime();
	}
}

function getChrono() {
	return (stop_time - start_time > 0 ? Math.round((stop_time - start_time) / 1000) : 0);
}

function getChronoString() {
	time = getChrono();
	time_min = Math.floor(time / 60);
	time_sec = time % 60;
	return time_min + ":" + (time_sec < 10 ? "0" : "") + time_sec;
}

function tictac() {
	counter--;
	if (counter <= 0) {
		lose();
	}
}
