/**
 * FS.js - script pour accéder au FileSystem du téléphone
 */
var directoryName = "drksimon";
var fileNameOptions = "options.txt";
var fileNameHighsc = "highscores.txt";
var fileSystem = 0;
var dir = 0;
var ficoptions = 0;
var fichighsc = 0;
var option_exists = false;
var ready_option = false;
var ready_highsc = false;
var ready_error = false;
var thread = null;
var game_options = new Array();
var game_highscores = new Array();
var new_install = false;

/** 
 * onFSInitSuccess - appelée lorsque l'initialisation du FS a abouti 
 */
function onFSInitSuccess(_fileSystem) {
 	fileSystem=_fileSystem;
 	fileSystem.root.getDirectory(directoryName, {create: true, exclusive: false}, onDirectoryInitSuccess, onFSError);
}

/** 
 * onDirectoryInitSuccess - appelée lorsque l'initialisation du DIR a abouti 
 */
function onDirectoryInitSuccess(_dir) {
	dir = _dir;
	dir.getFile(fileNameOptions, {create: true, exclusive: false}, onFileOptionsInitSuccess, onFSError);
	dir.getFile(fileNameHighsc, {create: true, exclusive: false}, onFileHighscInitSuccess, onFSError);
}

/** 
 * onFileOptionsInitSuccess - appelée lorsque l'initialisation du fichier OPTIONS a abouti 
 */
function onFileOptionsInitSuccess(_fileentry) {
	ficoptions = _fileentry;
	ficoptions.file(readOptions, onFSError);
}

/** 
 * onFileHighscInitSuccess - appelée lorsque l'initialisation du fichier HIGHSCORES a abouti 
 */
function onFileHighscInitSuccess(_fileentry) {
	fichighsc = _fileentry;
	fichighsc.file(readHighscores, onFSError);
}

/** 
 * onFSError - appelée lorsqu'une erreur est levée
 */
function onFSError(_error) {
	var message = "File System Error: " + _error.code;
	initOptions();
	initHighscores();
	// on est en erreur
    ready_error=true;
	activateApp();
    console.log(message);
}

/**
 * readTodoList - lecture du fichier TODO
 */ 
function readOptions(_file) {
	var reader = new FileReader();
	reader.onloadend = function(_evt) {
		var res = _evt.target.result;
		var list;
		if (res == "" || res == null) {
			initOptions();
		}
		else {
			list = res.split('\n');
			game_options = { "difficulty" : list[0], "name" : list[1], 
						"helponstart" : (list[2] == "true" ? true : false), 
						"soundactive" : (list[3] == "true" ? true : false), 
						"sharescore" : (list[4] == "true" ? true : false),
						"lang" : (list[5] == "" || list[5] == null ? "en" : list[5]) };
		}
        ready_option = true;
		activateApp();
   };
   reader.readAsText(_file);
}

/**
 * readTaskList - lecture du fichier TASK
 */ 
function readHighscores(_file) {
	var reader = new FileReader();
	reader.onloadend = function(_evt) {
		var res = _evt.target.result;
		var list;
		if (res == "" || res == null) {
			initHighscores();
		}
		else {
			list = res.split('\n');
			var item;
			var score1 =  new Array();
			for (i=0; i<10; i++) {
				item = list[i].split('#');
				score1.push({ "name" : item[0], "passe" : item[1], "score" : item[2]}); 
			}
			var score2 =  new Array();
			for (i=10; i<20; i++) {
				item = list[i].split('#');
				score2.push({ "name" : item[0], "passe" : item[1], "score" : item[2]}); 
			}
			var score3 =  new Array();
			for (i=20; i<30; i++) {
				item = list[i].split('#');
				score3.push({ "name" : item[0], "passe" : item[1], "score" : item[2]}); 
			}
			game_highscores = { "facile" : score1, "moyen" : score2, "difficile" : score3 };
		}
        ready_highsc = true;
		activateApp();
   };
   reader.readAsText(_file);
}

/**
 * writeTodoList - ecriture du fichier TODO
 */ 
function writeOptions() {
    if (isFirefoxOS()) {
		ffosFileOptionDelete();
	}
	else { 
		ficoptions.createWriter(
			function(writer) {
				var text = game_options.difficulty + '\n' + game_options.name + '\n' + 
					game_options.helponstart + '\n' + game_options.soundactive + '\n' +	
					game_options.sharescore + '\n' + game_options.lang;
				writer.onerror = onFSError;
				writer.write(text);
			}, onFSError
		);
	}
}

function writeHighscores() {
    if (isFirefoxOS()) {
		ffosFileHighscoreDelete();
	}
	else { 
		fichighsc.createWriter(
			function(writer) {
				var text = '';
				var hs = "";
				for (i = 0; i < 10; i++) {
					hs = game_highscores.facile[i];
					text += hs.name + "#" + hs.passe + "#" + hs.score + '\n';
				}
				for (i = 0; i < 10; i++) {
					hs = game_highscores.moyen[i];
					text += hs.name + "#" + hs.passe + "#" + hs.score + '\n';
				}
				for (i = 0; i < 10; i++) {
					hs = game_highscores.difficile[i];
					text += hs.name + "#" + hs.passe + "#" + hs.score + '\n';
				}
				writer.onerror = onFSError;
				writer.write(text);
			}, onFSError
		);
	}
}

/**
 * initFileSystem - intialisation du File System
 */
function initFileSystem() {
	if (isFirefoxOS()) {
		sdcard=navigator.getDeviceStorage("sdcard");
		ffosFileOptionRead();
		ffosFileHighscoreRead();
	}
	else { 
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSInitSuccess, 
		function(_evt){	
			onFSError(_evt.target);
		});
	} 
}

/**
 * isFsReady - renvoie true losque le périférique est pret
 */
function isFsReady() {
	return (ready_error || (ready_option && ready_highsc));
}  

/**
 * init HS
 */
function initHighscores() {
	// Initialisation des Highscores
	var score1 =  new Array();
	for (i=0; i<10; i++) {
		score1.push({ "name" : "-", "passe" : "0", "score" : 0}); 
	}
	var score2 =  new Array();
	for (i=0; i<10; i++) {
		score2.push({ "name" : "-", "passe" : "0", "score" : 0});
	} 
	var score3 =  new Array();
	for (i=0; i<10; i++) {
		score3.push({ "name" : "-", "passe" : "0", "score" : 0}); 
	}
	game_highscores = { "facile" : score1, "moyen" : score2, "difficile" : score3 };	
} 

/**
 * init options
 */
function initOptions() {
	// Initialisation des parametres
	game_options = { "difficulty" : 2, "name" : "Player 1", 
		"helponstart" : true, "soundactive" : true, 
		"sharescore" : false, "lang" : "en" };
	new_install = true;
}


function ffosFileOptionRead() {
	var request = sdcard.get(directoryName+"/"+fileNameOptions);
	request.onsuccess = function () {
		ficoptions = this.result;
		readOptions(ficoptions);
	}
	request.onerror = function() {
		initOptions();
        ready_option = true;
		activateApp();
	}
}

function ffosFileHighscoreRead() {
	var request = sdcard.get(directoryName+"/"+fileNameHighsc);
	request.onsuccess = function () {
		fichighsc = this.result;
		readHighscores(fichighsc);
	}
	request.onerror = function() {
		initHighscores();
        ready_highsc = true;
		activateApp();
	}
}

function ffosFileOptionWrite() {
	var text = game_options.difficulty + '\n' + game_options.name + '\n' + 
		game_options.helponstart + '\n' + game_options.soundactive + '\n' +	
		game_options.sharescore + '\n' + game_options.lang;
	var file = new Blob( [text], {type: "text/plain"});	
	request = sdcard.addNamed(file, directoryName+"/"+fileNameOptions);			
}

function ffosFileHighscoreWrite() {
	var text = '';
	var hs = "";
	for (i = 0; i < 10; i++) {
		hs = game_highscores.facile[i];
		text += hs.name + "#" + hs.passe + "#" + hs.score + '\n';
	}
	for (i = 0; i < 10; i++) {
		hs = game_highscores.moyen[i];
		text += hs.name + "#" + hs.passe + "#" + hs.score + '\n';
	}
	for (i = 0; i < 10; i++) {
		hs = game_highscores.difficile[i];
		text += hs.name + "#" + hs.passe + "#" + hs.score + '\n';
	}
	var file = new Blob( [text], {type: "text/plain"});	
	request = sdcard.addNamed(file, directoryName+"/"+fileNameHighsc);			
}

function ffosFileOptionDelete() {
	var request = sdcard.delete(directoryName+"/"+fileNameOptions);
	request.onsuccess = function() {
		ffosFileOptionWrite();
	}
	request.onerror = function() {
		ffosFileOptionWrite();
	}
}

function ffosFileHighscoreDelete() {
	var request = sdcard.delete(directoryName+"/"+fileNameHighsc);
	request.onsuccess = function() {
		ffosFileHighscoreWrite();
	}
	request.onerror = function() {
		ffosFileHighscoreWrite();
	}
}
