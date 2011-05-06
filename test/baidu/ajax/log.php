<?php
	$p1 = $_GET['info'];
	echo $p1;
	$file_pointer = fopen('tmp.inf.txt', "w");
	fwrite($file_pointer, $p1);
	fclose($file_pointer);
?>