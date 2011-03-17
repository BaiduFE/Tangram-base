<?php
/**
 * check get or post
 *
 */
if($_SERVER['REQUEST_METHOD'] == 'GET'){
	if(array_key_exists('type',$_GET)){
		$type = $_GET['type'];
		if($type=='redirection'){
			header("Location:request.php");
		}else if($type=='cache'){
			echo substr($_SERVER["QUERY_STRING"], 11).'dog';
		}else if($type=='on'){
			$status = $_GET['status'];
			switch($status){
				case 200:
					echo $status;
					break;
				case 320:
					header("Location:request.php?type=on&status=200");
					break;
				case 404:
					header("Location:notexist.php");
					break;
				case 500:
					echo $status;
					header("HTTP/1.1 500 Internal Server Error");
					break;
				default:

					break;
			}
		}
	}
	else if(sizeof($_GET) == 2){
		echo $_GET['var1'].$_GET['var2'];
	}else
	echo 'Hello World!';
}else{
	$p1 = $_POST['var1'];
	$p2 = $_POST['var2'];
	if ($p1==""||$p2==""){
		header('HTTP/1.1 500 error');
	}
	else {
		echo $p1 . $p2;
	}
}
?>