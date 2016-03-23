var snd1_snd = "/android_asset/www/sound/snd1.wav";
var m_snd1;
var s_snd1;
var snd2_snd = "/android_asset/www/sound/snd2.wav";
var m_snd2;
var s_snd2;
var snd3_snd = "/android_asset/www/sound/snd3.wav";
var m_snd3;
var s_snd3;
var snd4_snd = "/android_asset/www/sound/snd4.wav";
var m_snd4;
var s_snd4;
var sound_loaded = 0;

function soundLoaded() {
	sound_loaded++;
}

function isSoundReady() {
	return (sound_loaded == 4);
}

function soundErr(err) {
	alert(err);
}

function loadSounds() {
	m_snd1 = new Media(snd1_snd, soundLoaded, soundErr, function(s) { s_snd1 = s ;});
	m_snd2 = new Media(snd2_snd, soundLoaded, soundErr, function(s) { s_snd2 = s ;});
	m_snd3 = new Media(snd3_snd, soundLoaded, soundErr, function(s) { s_snd3 = s ;});
	m_snd4 = new Media(snd4_snd, soundLoaded, soundErr, function(s) { s_snd4 = s ;});
}
