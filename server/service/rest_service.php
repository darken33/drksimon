<?php
/**
 * Simple Webservice REST en PHP / JSON
 */
 include("http_response_code.php");
 
 $id_key = "";
 $dbuser = "root" ;
 $dbhost = "localhost";
 $dbname = "drksimon"; 
 $dbpasswd = "";

// Si la clé n'est pas fournie => 403
if (!isset($_GET['key']) || $id_key != $_GET['key']) {
	http_response_code(403);
	exit;
}
if (!isset($_GET['difficulty']) || ($_GET['difficulty'] != 1 && $_GET['difficulty'] != 2 && $_GET['difficulty'] != 3)) {
	http_response_code(400);
	exit;
}
if (!isset($_GET['name'])) {
	http_response_code(400);
	exit;
}
if (!isset($_GET['passe']) || !is_numeric($_GET['passe'])) {
	http_response_code(400);
	exit;
}
if (!isset($_GET['score']) || !is_numeric($_GET['score'])) {
	http_response;_code(400);
	exit;
}
$difficulty = $_GET['difficulty'];
$name = $_GET['name'];
$passe = $_GET['passe'];
$score = $_GET['score'];

// on se connecte à la DB
mysql_connect($dbhost,$dbuser,$dbpasswd);
mysql_select_db($dbname);

// On insere le score
$requete="INSERT INTO drksimon_score (`id` ,`name` ,`passe` ,`score` ,`difficulty`) VALUES (NULL , '".$name."', '".$passe."', '".$score."', '".$difficulty."');";
$result=mysql_query($requete);
$idrow=mysql_insert_id(); 

// On recupère les 10 meilleurs scores
$requete="SELECT `id`, `name`, `passe`, `score`, `difficulty` FROM drksimon_score WHERE `difficulty` = '".$difficulty."' ORDER BY score DESC;";
$result=mysql_query($requete);

$list = Array();
$pos = 1;
while ($row=mysql_fetch_array($result)) {
	if ($pos < 11 || $row['id'] == $idrow) {
		array_push($list, Array(
			'pos' => $pos,
			'isplayer' => ($row['id'] == $idrow ? 1 : 0),
			'difficulty'=>$row['difficulty'], 
			'name'=>$row['name'],
			'passe'=>$row['passe'], 
			'score'=>$row['score']
		));
		if ($pos > 10) break;
	}	
	$pos++;
}

/* on renvoie le resultat */
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode($list); //Array('list' => $list));
?>
