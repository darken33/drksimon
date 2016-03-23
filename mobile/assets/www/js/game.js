/**
 * game.js : script du jeu drkSimon
 * 
 * @author : Philippe Bousquet <darken33@free.fr>
 * @date   : 10/2013
 * @version: 1.0
 * 
 * This software is under GNU General Public License
 */
var game_version  = "1.0";
var ready = false;
var popclosed = false;
var started = false;
var gametimer = 10;
var intertimer = 1000;
var buttontimer = 250;
var idx = 0;
var play_idx;
var sequence = new Array();
var nb_games = 0;
var g_score=0;
var player = false;
var thread_anim_menu;
var thread_play_sequence;
var inthegame = false;
var perdu = false;

/**
 * initGame() - initialisation du jeu
 */ 		 
function initSequence() {
	$('#simon_led').removeClass("ok");
	sequence.push(Math.floor(Math.random()*4));
	idx = 0;
	setTimeout(playSequence, intertimer);
}

function playSequence() {
	$('#simon_front').removeClass("red_on");
	$('#simon_front').removeClass("blue_on");
	$('#simon_front').removeClass("yellow_on");
	$('#simon_front').removeClass("green_on");
	if (game_options.soundactive) {
		if (s_snd1 == Media.MEDIA_RUNNING) m_snd1.stop();
		if (s_snd2 == Media.MEDIA_RUNNING) m_snd2.stop();
		if (s_snd3 == Media.MEDIA_RUNNING) m_snd3.stop();
		if (s_snd4 == Media.MEDIA_RUNNING) m_snd4.stop();
	}
	setTimeout(function() {
	if (idx < sequence.length) {
		switch (sequence[idx]) {
			case 0 : anim_button1();
					 break;
			case 1 : anim_button2();
					 break;
			case 2 : anim_button3();
					 break;
			case 3 : anim_button4();
					 break;
			default : anim_simon();
					 break;
		}
		idx++;
		setTimeout(playSequence, intertimer);
	}
	else {
		clearInterval(thread_play_sequence);
		thread_play_sequence = null;
		counter = gametimer;
		anim_simon();
		bindInGame();
		startChrono();
		play_idx = 0;
	}}, buttontimer);
}

function validSequence(val) {
	$('#simon_led').removeClass("play");
	if (val == sequence[play_idx]) {
		nb_games++;
		g_score += Math.round(100 * game_options.difficulty * counter / gametimer);
		counter = gametimer;
		play_idx++;
		if (play_idx == sequence.length) {
			stopChrono();
			anim_simon_ok();
			unbindInGame();
			setTimeout(initSequence, 1000);
		}
	}
	else {
		lose();
	}
}

/**
 * startGame() - demarrer la partie
 */
function startGame() {
	$("#menu").hide();
	$('#simon_led').removeClass("ko");
	if (game_options.difficulty == 1) {
		gametimer = 10;
		intertimer = 1000;
	}
	else if (game_options.difficulty == 2) {
		gametimer = 7;
		intertimer = 500;
	}
	else {
		gametimer = 5;
		intertimer = 250;
	}
	$.mobile.changePage('#ingame', 'none', true, true);	
	inthegame = true;
	clearInterval(thread_anim_menu);
	thread_anim_menu = null;
	g_score = 0;
	nb_games = 0;
	sequence = new Array();
	initSequence();
}

/**
 * lose() - La bombe explose
 */ 
function lose() {
	anim_simon_ko();
	unbindInGame();
	stopChrono();
	setTimeout(function () {
		inthegame = false;
		perdu=true;
		navigator.notification.vibrate(1000);
		score();
	}, buttontimer);
}

function playAnimMenu() {
	$("#simon_menu_front").removeClass("red_on");
	$("#simon_menu_front").removeClass("blue_on");
	$("#simon_menu_front").removeClass("yellow_on");
	$("#simon_menu_front").removeClass("green_on");
	$("#simon_menu_front").removeClass("play");
	r = Math.floor(Math.random()*5);
	if (r == 0) $("#simon_menu_front").addClass("red_on");
	else if (r == 1) $("#simon_menu_front").addClass("blue_on");
	else if (r == 2) $("#simon_menu_front").addClass("yellow_on");
	else if (r == 3) $("#simon_menu_front").addClass("green_on");
	else $("#simon_menu_front").addClass("play");
}

/**
 * score() - affiche le score obtenu
 */ 
function score() {
	$("#scr").html(game_options.name +"<br/>" + nb_games +" notes<br/>"+ g_score+"<br/>");
	updateHighscore(nb_games, g_score);
	if (game_options.sharescore) {
		service(nb_games, g_score);
	}
	$.mobile.changePage('#score', 'none', true, true);	
	bindGame();
	thread_anim_menu = setInterval(playAnimMenu, 1000);	
}
function backToTitle() {
	inthegame = false;
	unbindInGame();
	bindGame();
	if (thread_anim_menu == null) {
		thread_anim_menu = setInterval(playAnimMenu, 1000);	
	}
	$.mobile.changePage('#game', 'none', true, true);	
}
/**
 * onBackButton() - bouton back pressé
 */ 
function onBackButton() {
	if ($("#menu").is(':visible')) {
		$("#menu").hide();
	}
	else { 
		if ($('#param-1').css('display') == 'block') {
			updateParam();
			inthegame = false;
			$.mobile.changePage('#game', 'none', true, true);
		}	
		else if ($('#score').css('display') == 'block') {
			quitscore();
		}
		else if ($('#hsc_local').css('display') == 'block') {
			quithscl();
		}
		else if ($('#hsc_internet').css('display') == 'block') {
			quithsci();
		}
		else if ($('#ingame').css('display') == 'block') {
			if (!inthegame) {
				backToTitle();
			}
			else {
				lose();
			}
			$.mobile.changePage('#game', 'none', true, true);
		}
		else if ($('#game').css('display') != 'block') {
			backToTitle();
		}
		else {
			quit();
		}
	}
}

/**
 * onMenuButton() - bouton menu pressé
 */ 
function onMenuButton() {
	if ($('#game').css('display') == 'block' && !$("#splash").is(':visible')) {
		if ($("#menu").is(':visible')) {
			$("#menu").hide();
		} 
		else {
			$('#menu').show();
		}
	}
}    

/**
 * closeMenu() - fermer le menu
 */     
function  closeMenu() {
	if ($("#menu").is(':visible')) {
		$("#menu").hide();
	}
	else if (!inthegame && popclosed) {
		$("#menu").show();
	}
}

/**
 * quit() - quitter le jeu
 */ 
function quit() {
	if ($("#menu").is(':visible')) {
		$("#menu").hide();
	}
	if (confirm("Voulez vous quitter jeu ?")) {
		navigator.app.exitApp();
	}
}

/**
 * aide() - afficher la page d'aide
 */ 
function aide() {
	$.mobile.changePage('#aide-1', 'none', true, true);
}

/**
 * param() - afficher la page des paramètres
 */ 
function param() {
	game_diff = '<option value="1" '+(game_options.difficulty == 1 ? 'selected="selected"' : '')+'>Facile</option>';
	game_diff += '<option value="2" '+(game_options.difficulty == 2 ? 'selected="selected"' : '')+'>Moyen</option>';
	game_diff += '<option value="3" '+(game_options.difficulty == 3 ? 'selected="selected"' : '')+'>Difficile</option>';
	$('#game_level').html(game_diff);
	$('#game_name').val(game_options.name);
	if (game_options.helponstart) $('#game_help').attr('checked', "checked");
	if (game_options.soundactive) $('#game_sound').attr('checked', "checked");
	if (game_options.sharescore) $('#game_score').attr('checked', "checked");
	$.mobile.changePage('#param-1', 'none', true, true);
}

/**
 * updateparam() - MAJ des paramètres
 */ 
function updateParam() {
	game_options.difficulty = $('#game_level').val();
	game_options.name = $('#game_name').val(); 
	game_options.helponstart = ($('#game_help').attr('checked') == "checked");
	game_options.soundactive = ($('#game_sound').attr('checked') == "checked");
	game_options.sharescore = ($('#game_score').attr('checked') == "checked");
	writeOptions();
}

/**
 * unbindGame() - supprimer la gestion des evenements
 */ 
function unbindGame() {
	$("#menub").off("tap");
	$("#simon_menu_go").off("tap");
}

/**
 * bindGame() - gestion des evenements sur l'ecran
 */ 
function bindGame() {
	unbindGame();
	$("#menub").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		if (popclosed) closeMenu();
	});	
	$("#simon_menu_go").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		startGame();
	});
}

function anim_simon() {
	$('#simon_led').addClass("play");
}

function anim_simon_ok() {
	$('#simon_led').addClass("ok");
}

function anim_simon_ko() {
	$('#simon_led').addClass("ko");
}

function anim_button1() {
	$('#simon_front').addClass("red_on");
	if (inthegame && game_options.soundactive) {
		m_snd1.play();
	}
}

function anim_button2() {
	$('#simon_front').addClass("blue_on");
	if (inthegame && game_options.soundactive) {
		m_snd2.play();
	}
}

function anim_button3() {
	$('#simon_front').addClass("yellow_on");
	if (inthegame && game_options.soundactive) {
		m_snd3.play();
	}
}

function anim_button4() {
	$('#simon_front').addClass("green_on");
	if (inthegame && game_options.soundactive) {
		m_snd4.play();
	}
}

function button1() {
	if (game_options.soundactive && s_snd1 == Media.MEDIA_RUNNING) {
		m_snd1.stop();
	}
	anim_button1();
	setTimeout(function() {
		$('#simon_front').removeClass("red_on");
		validSequence(0);
	}, buttontimer);	
}

function button2() {
	if (game_options.soundactive && s_snd2 == Media.MEDIA_RUNNING) {
		m_snd2.stop();
	}
	anim_button2();
	setTimeout(function() {
		$('#simon_front').removeClass("blue_on");
		validSequence(1);
	}, buttontimer);	
}

function button3() {
	if (game_options.soundactive && s_snd3 == Media.MEDIA_RUNNING) {
		m_snd3.stop();
	}
	anim_button3();
	setTimeout(function() {
		$('#simon_front').removeClass("yellow_on");
		validSequence(2);
	}, buttontimer);	
}

function button4() {
	if (game_options.soundactive && s_snd4 == Media.MEDIA_RUNNING) {
		m_snd4.stop();
	}
	anim_button4();
	setTimeout(function() {
		$('#simon_front').removeClass("green_on");
		validSequence(3);
	}, buttontimer);	
}

function unbindInGame() {
	$("#button1").off("tap");
	$("#button2").off("tap");
	$("#button3").off("tap");
	$("#button4").off("tap");
}

/**
 * bindGame() - gestion des evenements sur l'ecran
 */ 
function bindInGame() {
	unbindGame();
	$("#button1").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		button1();
	});	
	$("#button2").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		button2();
	});	
	$("#button3").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		button3();
	});	
	$("#button4").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		button4();
	});	
}

/**
 * bindMenu() - gestion des evenements du menu
 */ 
function bindMenu() {
	$("#mstart").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		startGame();
		closeMenu();
	});
	$("#mparam").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		param();
		closeMenu();
	});
	$("#mhelp").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		aide(); 
		closeMenu();
	});
	$("#mquit").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		quit(); 
	});
}

/**
 * initiailsation du jeu
 */ 
function init() {
	ready=false;
	popclosed=false;
	document.addEventListener("deviceready", onDeviceReady, true);		
	setTimeout(onDeviceReady, 5000);
}

/**
 * phoneGap ready
 */ 
var onDeviceReady = function() {
	if (!ready) {
		document.addEventListener("backbutton", onBackButton, true);
		document.addEventListener("menubutton", onMenuButton, true);
		initFileSystem();
		loadSounds();
		n=0;
		do {
			n++;
		} while (!isFsReady() && n < 5000)
		if (n == 5000) {
			new_install = true;
			initOptions();
			initHighscores();	
		}
		$.mobile.changePage('#game', 'none', true, true);
		inthegame = false;
		bindGame();	
		bindMenu();
		thread_anim_menu = setInterval(playAnimMenu, 1000);	
		ready = true;
		if (game_options.helponstart) {
			popclosed = false;
			popup();
		} 
		else {
			popclosed = true;
		}
	}
};

function closepop() {
	$("#splash").hide();
	$('#game').unbind('tap');
	popclosed = true;
	if (new_install) {
		param();
	}
}

function popup() {
	header = '<div data-role="header"><h2>Aide</h2></div>',
	closebtn = "",
	popup = '';
	if ($(window).width() < 320) {
		popup = '<div data-role="popup" id="splash" class="popup" data-short="Comment Jouer ?" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15" style="background: #a0a0a0;">' + closebtn + header +
				'<div data-role="content" style="text-align: justify; background: #a0a0a0; color: #000000; text-shadow: none; font-weight: normal; font-size: 70%;">' +
					'<strong>"menu"</strong> : affiche le menu du jeu (jouer, options, aide, quitter).<br/>'+
					'<strong>"Simon"</strong> : d&eacute;marre la partie.<br/>'+ 
					'<strong>"Le jeu"</strong> : r&eacute;p&eacute;tez les s&eacute;quences propos&eacute;es.<br/>'+
					'Bonne partie...' +
				'</div>' +	
		'</div>';
	}
	else if ($(window).width() < 480) {
		popup = '<div data-role="popup" id="splash" class="popup" data-short="Comment Jouer ?" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15" style="background: #a0a0a0;">' + closebtn + header +
				'<div data-role="content" style="text-align: justify; background: #a0a0a0; color: #000000; text-shadow: none; font-weight: normal; font-size: 90%;">' +
					'La touche <strong>"menu"</strong>, ou un appui long sur l\'&eacute;cran de votre t&eacute;l&eacute;phone permet d\'afficher le menu du jeu (jouer, options, aide, quitter).<br/>'+
					'Touchez le <strong>Simon</strong> pour d&eacute;marrer la partie. Il va alors vous proposer une s&eacute;quence de couleurs qu\'il vous faudra m&eacute;moriser et r&eacute;p&eacute;ter, '+
					'<strong>Simon</strong> augmente alors la s&eacute;quence d\'une couleur et le jeu continue tant que vous ne faites pas d\'erreur.<br/>' +
					'Bonne partie...' +
				'</div>' +	
		'</div>';
	}
	else {
		popup = '<div data-role="popup" id="splash" class="popup" data-short="Comment Jouer ?" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15" style="background: #a0a0a0; top: 30%; bottom: 30%; left: 15%; right: 15%;">' + closebtn + header +
				'<div data-role="content" style="text-align: justify; background: #a0a0a0; color: #000000; text-shadow: none; font-weight: normal;">' +
				'<strong>Comment jouer ?</strong><br/>' +
				'Pour faire appara&icirc;tre le menu il suffit d\'appuyer sur la touche <strong>"menu"</strong>, ou simplement d\'effectuer un appui long sur l\'&eacute;cran, vous pourrez d&eacute;finir le niveau de jeu dans les param&egrave;tres.<br/>' +
				'Pour d&eacute;marrer une partie, appuyez sur le <strong>Simon</strong> il faut alors r&eacute;p&eacute;ter les s&eacute;quences de couleurs propos&eacute;es par le jeu. Tant que vous ne faites pas d\'erreur, la s&eacute;quence se voit allong&eacute;e d\'une couleur.<br/>' +
				'Combien de temps allez vous tenir avant de vous faire avoir par <strong>Simon</strong> ?<br/>' +
				'Bonne partie...' +
				'</div>' +	
		'</div>';	
	}

	// Create the popup. Trigger "pagecreate" instead of "create" because currently the framework doesn't bind the enhancement of toolbars to the "create" event (js/widgets/page.sections.js).
	$.mobile.activePage.append( popup ).trigger( "pagecreate" );
	// Wait with opening the popup until the popup image has been loaded in the DOM.
	// This ensures the popup gets the correct size and position
	// Fallback in case the browser doesn't fire a load event
	var fallback = setTimeout(function() {
		$("#game").bind("tap", function(event) {
			event.preventDefault();
			closepop();
		});
		$( "#splash").show();
	}, 1000);
}

