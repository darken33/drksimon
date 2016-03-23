
function updateHighscore(passe, score) {
	var tabscores = (game_options.difficulty == 1 ?
		game_highscores.facile : (game_options.difficulty == 2 ?
		game_highscores.moyen : game_highscores.difficile));
	var i=0;
	for (i=0; (i < 10 && tabscores[i].score > score); i++);
	if (i<9) {
		for (j=9; j>i; j--) {
			tabscores[j].name = tabscores[j-1].name;
			tabscores[j].passe = tabscores[j-1].passe;
			tabscores[j].score = tabscores[j-1].score;
		}
	}	
	if (i<10) {
		tabscores[i].name = game_options.name;
		tabscores[i].passe = passe;
		tabscores[i].score = score;
	}
	if (game_options.difficulty == 1) {
		game_highscores.facile = tabscores;
	}
	else if (game_options.difficulty == 2) {
		game_highscores.moyen = tabscores;
	}
	else {
		game_highscores.difficile = tabscores;
	}
	writeHighscores();
	fillHighscoreLocHtml(passe, score);
}

function fillHighscoreLocHtml(passe, score) {
	document.getElementById("hst_loc").innerHTML = "Meilleurs Scores : " + (game_options.difficulty == 1 ? "Facile" : (game_options.difficulty == 2 ? "Moyen" : "Difficile"));
	var tableScore = '<tr><th style="text-align: right;">#</th><th style="text-align: left;">Nom</th><th style="text-align: right;">Notes</th><th style="text-align: right;">Score</th></tr>';
	var tabscores = (game_options.difficulty == 1 ? game_highscores.facile : (game_options.difficulty == 2 ? game_highscores.moyen : game_highscores.difficile));
	var hlgt = false;
	for (i=0; i<10; i++) {
		cl = ((tabscores[i].name == game_options.name &&
			   tabscores[i].passe == passe &&
			   tabscores[i].score == score && !hlgt) ? "hlg" : "");
		if (cl == "hlg") hlgt = true;	   
		if (tabscores[i].name == "-" &&
			   tabscores[i].passe == 0 &&
			   tabscores[i].score == 0) {
			tableScore += '<tr><td style="text-align: right;" class="'+cl+'">'+(i+1)+'.</td>' +
					'<td style="text-align: left;" class="'+cl+'">-</td>' +
					'<td style="text-align: right;" class="'+cl+'">-</td>' +
					'<td style="text-align: right;" class="'+cl+'">-</td></tr>';
		}	
		else {   
			tableScore += '<tr><td style="text-align: right;" class="'+cl+'">'+(i+1)+'.</td>' +
					'<td style="text-align: left;" class="'+cl+'">'+tabscores[i].name+'</td>' +
					'<td style="text-align: right;" class="'+cl+'">'+tabscores[i].passe+'</td>' +
					'<td style="text-align: right;" class="'+cl+'">'+tabscores[i].score+'</td></tr>';
		}
	}
	document.getElementById("hsc_loc").innerHTML = tableScore;
}

function quitscore() {
	inthegame = false;
	$.mobile.changePage('#hsc_local', 'none', true, true); 	
}

function quithscl() {
	inthegame = false;
	if (game_options.sharescore) {
		$.mobile.changePage('#hsc_internet', 'none', true, true); 	
	}
	else {
		$.mobile.changePage('#game', 'none', true, true); 	
	}	
}

function quithsci() {
	inthegame = false;
	$.mobile.changePage('#game', 'none', true, true); 	
}

function service(passes, score) {
	var tableScore = "<tr><td>Chargement, veuillez patienter...</td></tr>";
	document.getElementById("hsc_int").innerHTML = tableScore;
	var key = "4500bf2526b386d005beda71018bf881";
	var difficulty = game_options.difficulty;
	var name = game_options.name;
	var passe = passes;
	var score = score;
	var url = "http://darken33.free.fr/drksimon/services/rest_service.php?key="+key+"&difficulty="+difficulty+"&name="+name+"&passe="+passe+"&score="+score;
	$.getJSON(url, function(data) {
		fillHighscoreIntHtml(data);
	}).fail(function() { 
		var tableScore = '<tr><td style="color: #FF0000">Impossible de charger les scores<br/>V&eacute;rifiez votre connexion Internet...</td></tr>';
		document.getElementById("hsc_int").innerHTML = tableScore;
	});
}		

function fillHighscoreIntHtml(data) {
	document.getElementById("hst_int").innerHTML = "Meilleurs Scores Mondiaux : " + (game_options.difficulty == 1 ? "Facile" : (game_options.difficulty == 2 ? "Moyen" : "Difficile"));
	var tableScore = '<tr><th style="text-align: right;">#</th><th style="text-align: left;">Nom</th><th style="text-align: right;">Notes</th><th style="text-align: right;">Score</th></tr>';
	var tabscores = data;
	for (i=0; i<10; i++) {
		if (i < tabscores.length) {
			cl = (tabscores[i].isplayer == 1 ? "hlg" : "");
			tableScore += '<tr><td style="text-align: right;" class="'+cl+'">'+tabscores[i].pos+'.</td>' +
					'<td style="text-align: left;" class="'+cl+'">'+tabscores[i].name+'</td>' +
					'<td style="text-align: right;" class="'+cl+'">'+tabscores[i].passe+'</td>' +
					'<td style="text-align: right;" class="'+cl+'">'+tabscores[i].score+'</td></tr>';
		}
		else {
			tableScore += '<tr><td style="text-align: right;" >'+(i+1)+'.</td>' +
					'<td style="text-align: left;" >-</td>' +
					'<td style="text-align: right;" >-</td>' +
					'<td style="text-align: right;" >-</td></tr>';
		}
	}
	if (tabscores.length == 11) {
		tableScore += '<tr><td style="text-align: center;" colspan="5">...</td></tr>';
		cl = "hlg";
		tableScore += '<tr><td style="text-align: right;" class="'+cl+'">'+tabscores[10].pos+'.</td>' +
					'<td style="text-align: left;" class="'+cl+'">'+tabscores[10].name+'</td>' +
					'<td style="text-align: right;" class="'+cl+'">'+tabscores[10].passe+'</td>' +
					'<td style="text-align: right;" class="'+cl+'">'+tabscores[10].score+'</td></tr>';
	}
	document.getElementById("hsc_int").innerHTML = tableScore;
}
