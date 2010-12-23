<?php

function geneHistory($html){
	if (!file_exists('c:/temp/workspaz/base-history'))
	mkdir('c:/temp/workspaz/base-history/',0777,true);
	date_default_timezone_set('PRC');
	$time = date('Y-m-d-H-i-s');
	$file_name = 'c:/temp/workspaz/base-history/'.$time.'.html';
	$file_pointer = fopen($file_name, "w");
	fwrite($file_pointer, $html);
	fclose($file_pointer);
}

?>