<?php
	$p1 = $_POST['var1'];
	$p2 = $_POST['var2'];
	if ($p1==""||$p2=="")
	{
		header('HTTP/1.1 500 error');
	}
	else {
		echo $p1 . $p2;
	}
?>