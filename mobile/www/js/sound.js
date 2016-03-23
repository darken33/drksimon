var snd1_snd = "/android_asset/www/sound/snd1.wav";
var m_snd1;
var m2_snd1;
var s_snd1;
var b_snd1=false;
var snd2_snd = "/android_asset/www/sound/snd2.wav";
var m_snd2;
var m2_snd2;
var s_snd2;
var b_snd2=false;
var snd3_snd = "/android_asset/www/sound/snd3.wav";
var m_snd3;
var m2_snd3;
var s_snd3;
var b_snd3=false;
var snd4_snd = "/android_asset/www/sound/snd4.wav";
var m_snd4;
var m2_snd4;
var s_snd4;
var b_snd4=false;
var sound_loaded = 0;

function soundLoaded() {
	sound_loaded++;
}

function isSoundReady() {
	return (sound_loaded == 8);
}

function soundErr(err) {
}

function loadSounds() {
	if (isFirefoxOS()) {
		m_snd1 = document.getElementById("snd1_snd");
		m_snd2 = document.getElementById("snd2_snd");
		m_snd3 = document.getElementById("snd3_snd");
		m_snd4 = document.getElementById("snd4_snd");
		m2_snd1 = document.getElementById("snd1_snd2");
		m2_snd2 = document.getElementById("snd2_snd2");
		m2_snd3 = document.getElementById("snd3_snd2");
		m2_snd4 = document.getElementById("snd4_snd2");
		sound_loaded = 8;
	}
	else {
		m_snd1 = new Media(snd1_snd, soundLoaded, soundErr, function(s) { s_snd1 = s ;});
		m2_snd1 = new Media(snd1_snd, soundLoaded, soundErr, function(s) { s_snd1 = s ;});
		m_snd2 = new Media(snd2_snd, soundLoaded, soundErr, function(s) { s_snd2 = s ;});
		m2_snd2 = new Media(snd2_snd, soundLoaded, soundErr, function(s) { s_snd2 = s ;});
		m_snd3 = new Media(snd3_snd, soundLoaded, soundErr, function(s) { s_snd3 = s ;});
		m2_snd3 = new Media(snd3_snd, soundLoaded, soundErr, function(s) { s_snd3 = s ;});
		m_snd4 = new Media(snd4_snd, soundLoaded, soundErr, function(s) { s_snd4 = s ;});
		m2_snd4 = new Media(snd4_snd, soundLoaded, soundErr, function(s) { s_snd4 = s ;});
	}
}
