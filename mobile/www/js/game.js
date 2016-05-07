/**
 * game.js : script du jeu drkSimon
 * 
 * @author : Philippe Bousquet <darken33@free.fr>
 * @date   : 10/2013
 * @version: 1.0
 * 
 * This software is under GNU General Public License
 */
var game_version  = "1.5";
var navplay = false;
var ready = false;
var popclosed = false;
var started = false;
var gametimer = 10;
var intertimer = 1000;
var buttontimer = 250;
var buttonidle = 50;
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

function isFirefoxOS() {
	return (device.platform == "firefoxos");
}

/**
 * initGame() - initialisation du jeu
 */ 		 
function initSequence() {
	$('#simon_led').removeClass("ok");
	sequence.push(Math.floor(Math.random()*4));
	idx = 0;
	setTimeout(playSequence, intertimer);
}

function stopSound() {
	if (game_options.soundactive) {
		if (isFirefoxOS()) {
			if (!m_snd1.paused) {
				m_snd1.pause();
				m_snd1.currentTime=0.0;
			}
			if (!m_snd2.paused) {
				m_snd2.pause();
				m_snd2.currentTime=0.0;
			}
			if (!m_snd3.paused) {
				m_snd3.pause();
				m_snd3.currentTime=0.0;
			}
			if (!m_snd4.paused) {
				m_snd4.pause();
				m_snd4.currentTime=0.0;
			}
		}
		else {
			if (s_snd1 == Media.MEDIA_RUNNING) m_snd1.stop();
			if (s_snd2 == Media.MEDIA_RUNNING) m_snd2.stop();
			if (s_snd3 == Media.MEDIA_RUNNING) m_snd3.stop();
			if (s_snd4 == Media.MEDIA_RUNNING) m_snd4.stop();
		}
	}
}

function playSequence() {
	$('#simon_front').removeClass("red_on");
	$('#simon_front').removeClass("blue_on");
	$('#simon_front').removeClass("yellow_on");
	$('#simon_front').removeClass("green_on");
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
	$("#txt_score").html(texte_hsc_score[game_options.lang]);
	$("#scr").html(game_options.name +"<br/>" + nb_games +" "+texte_hsc_notes[game_options.lang]+"<br/>"+ g_score+"<br/>");
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
	navigator.notification.confirm(
		texte_alert_quitter[game_options.lang],
		quitConfirm,
		'Exit',
		['Ok','Cancel']
	);
}

function quitConfirm(btnIdx) {
	if (btnIdx == 1) {
		if (device.platform == "firefoxos") window.close();
		else navigator.app.exitApp();
		
	}
}

/**
 * aide() - afficher la page d'aide
 */ 
function aide() {
	$("#help_subtitle").html(texte_sous_titre[game_options.lang]);
	$("#help_content").html(texte_aide_content[game_options.lang]);
	$.mobile.changePage('#aide-1', 'none', true, true);
}

function dons() {
	$("#dons_content").html(texte_dons_content[game_options.lang]);
	$.mobile.changePage('#dons', 'none', true, true);
}

function loading() {
	$.mobile.changePage('#loading', 'none', true, true);
}

/**
 * param() - afficher la page des paramètres
 */ 
function param() {
	$('#txt_param').html(texte_param_title[game_options.lang]);
	game_lang = '<option value="fr" '+(game_options.lang == "fr" ? 'selected="selected"' : '')+'>'+texte_option_langue_fr[game_options.lang]+'</option>';
	game_lang += '<option value="en" '+(game_options.lang == "en" ? 'selected="selected"' : '')+'>'+texte_option_langue_en[game_options.lang]+'</option>';
	game_lang += '<option value="es" '+(game_options.lang == "es" ? 'selected="selected"' : '')+'>'+texte_option_langue_es[game_options.lang]+'</option>';
	$('#l_game_lang').html(texte_option_langage[game_options.lang]);
	$('#game_lang').html(game_lang).selectmenu().selectmenu("refresh");
	game_diff = '<option value="1" '+(game_options.difficulty == 1 ? 'selected="selected"' : '')+'>'+texte_difficulte_facile[game_options.lang]+'</option>';
	game_diff += '<option value="2" '+(game_options.difficulty == 2 ? 'selected="selected"' : '')+'>'+texte_difficulte_moyen[game_options.lang]+'</option>';
	game_diff += '<option value="3" '+(game_options.difficulty == 3 ? 'selected="selected"' : '')+'>'+texte_difficulte_difficile[game_options.lang]+'</option>';
	$('#l_game_level').html(texte_niveau[game_options.lang]);
	$('#game_level').html(game_diff).selectmenu().selectmenu("refresh");
	$('#l_game_name').html(texte_nom[game_options.lang]);
	$('#game_name').val(game_options.name);
	$('#l_options').html(texte_options[game_options.lang]);
	$('#l_game_help').html(texte_option_aide[game_options.lang]);
	$('#l_game_sound').html(texte_option_sons[game_options.lang]);
	$('#l_game_score').html(texte_option_share[game_options.lang]);
	if (game_options.helponstart) $('#game_help').attr('checked', true);
	if (game_options.soundactive) $('#game_sound').attr('checked', true);
	if (game_options.sharescore) $('#game_score').attr('checked', true);
	$('#game_sound').checkboxradio().checkboxradio("refresh");
	$('#game_help').checkboxradio().checkboxradio("refresh");
	$('#game_score').checkboxradio().checkboxradio("refresh");
	$.mobile.changePage('#param-1', 'none', true, true);
}

/**
 * updateparam() - MAJ des paramètres
 */ 
function updateParam() {
	game_options.lang = $('#game_lang').val();
	game_options.difficulty = $('#game_level').val();
	game_options.name = $('#game_name').val(); 
	game_options.helponstart = ($('#game_help').attr('checked') == "checked");
	game_options.soundactive = ($('#game_sound').attr('checked') == "checked");
	game_options.sharescore = ($('#game_score').attr('checked') == "checked");
	writeOptions();
	updateMenu();
}

function updateMenu() {
	$('#m_txt_jouer').html(texte_menu_jouer[game_options.lang]);
	$('#m_txt_param').html(texte_menu_param[game_options.lang]);
	$('#m_txt_aide').html(texte_menu_aide[game_options.lang]);
	$('#m_txt_quitter').html(texte_menu_quitter[game_options.lang]);
	$('#m_txt_dons').html(texte_menu_dons[game_options.lang]);
}

/**
 * unbindGame() - supprimer la gestion des evenements
 */ 
function unbindGame() {
	$("#menub").off("tap");
	$("#simon_menu_go").off("tap");
	$("#param_back").off("tap");
	$("#hlp_back").off("tap");
	$("#score").off("tap");
	$("#hsc_local").off("tap");
	$("#hsc_internet").off("tap");
	$("#b_score").off("tap");
	$("#b_hsc_local").off("tap");
	$("#b_hsc_internet").off("tap");
	$("#dons_back").off("tap");
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
	$("#param_back").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		onBackButton();
	});
	$("#hlp_back").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		onBackButton();
	});
	$("#score").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		quitscore();
	});
	$("#hsc_local").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		quithscl();
	});
	$("#hsc_internet").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		quithsci();
	});
	$("#b_score").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		quitscore();
	});
	$("#b_hsc_local").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		quithscl();
	});
	$("#b_hsc_internet").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		quithsci();
	});
	$("#dons_back").on("tap",  function(event) {
		event.preventDefault();
		event.stopPropagation();
		onBackButton();
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
		if (b_snd1) m2_snd1.play();
		else m_snd1.play();
		b_snd1 = !b_snd1;
	}
}

function anim_button2() {
	$('#simon_front').addClass("blue_on");
	if (inthegame && game_options.soundactive) {
		if (b_snd2) m2_snd2.play();
		else m_snd2.play();
		b_snd2 = !b_snd2;
	}
}

function anim_button3() {
	$('#simon_front').addClass("yellow_on");
	if (inthegame && game_options.soundactive) {
		if (b_snd3) m2_snd3.play();
		else m_snd3.play();
		b_snd3 = !b_snd3;
	}
}

function anim_button4() {
	$('#simon_front').addClass("green_on");
	if (inthegame && game_options.soundactive) {
		if (b_snd4) m2_snd4.play();
		else m_snd4.play();
		b_snd4 = !b_snd4;
	}
}

function button1() {
	anim_button1();
	setTimeout(function() {
		$('#simon_front').removeClass("red_on");
		validSequence(0);
	}, buttontimer);	
}

function button2() {
	anim_button2();
	setTimeout(function() {
		$('#simon_front').removeClass("blue_on");
		validSequence(1);
	}, buttontimer);	
}

function button3() {
	anim_button3();
	setTimeout(function() {
		$('#simon_front').removeClass("yellow_on");
		validSequence(2);
	}, buttontimer);	
}

function button4() {
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
	$("#mdons").on("tap", function(event) {
		event.preventDefault();
		event.stopPropagation();
		dons(); 
		closeMenu();
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

function closepop() {
	$("#splash").hide();
	$('#game').unbind('tap');
	popclosed = true;
	if (new_install) {
		param();
	}
}

function popup() {
	header = '<div data-role="header"><h2>'+texte_aide_title[game_options.lang]+'</h2></div>',
	closebtn = "",
	popup = '';
	if ($(window).width() < 320) {
		popup = '<div data-role="popup" id="splash" class="popup" data-short="Comment Jouer ?" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15" style="background: #a0a0a0;">' + closebtn + header +
				texte_popup_mini[game_options.lang] + 
				'</div>';
	}
	else if ($(window).width() < 480) {
		popup = '<div data-role="popup" id="splash" class="popup" data-short="Comment Jouer ?" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15" style="background: #a0a0a0;">' + closebtn + header +
				texte_popup_normal[game_options.lang] + 
				'</div>';
	}
	else {
		popup = '<div data-role="popup" id="splash" class="popup" data-short="Comment Jouer ?" data-theme="none" data-overlay-theme="a" data-corners="false" data-tolerance="15" style="background: #a0a0a0; top: 30%; bottom: 30%; left: 15%; right: 15%;">' + closebtn + header +
				texte_popup_grand[game_options.lang] + 
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

/**
 * phoneGap ready
 */ 
var onDeviceReady = function() {
	if (!ready) {
		document.addEventListener("backbutton", onBackButton, true);
		document.addEventListener("menubutton", onMenuButton, true);
		document.querySelector("#game_lang").addEventListener("change", function onchange(event) {
			loading(); 
			updateParam(); 
			param();
			event.preventDefault();
		}, true);
		initFileSystem();
		loadSounds();
		if (navplay) {
			new_install = true;
			initOptions();
			initHighscores();	
			activateApp();
		}
	}
};

function activateApp() {
	if (!ready && (isFsReady() || navplay)) {
		updateMenu();
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
}

// Lancement de la méthode init
init();
