<?php

	$fp = fopen("results.dat", "a+");

	if($fp && !empty($_POST['data'])){
		fputs($fp, serialize($_POST['data']) . "\n");
	}
	
	fclose($fp);

?>