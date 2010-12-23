<?php
//	$preSymbol = false;
//	foreach($_GET as $key=>$value) {
//		if ($preSymbol) echo '&';
//		echo $key . '=' . $value;
//		$preSymbol = true;
//	}
//
$req = $_SERVER['REQUEST_METHOD'] == 'GET' ? $_GET : $_POST;
$res = "";
foreach($req as $key=>$value){
	$res.="&$key=$value";
}
echo substr($res, 1);
?>