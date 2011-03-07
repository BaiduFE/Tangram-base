<?php

function geneHistory($html){
	$path = '/home/work/repos/report/base';
	if (!file_exists($path))
	mkdir($path,0777,true);
	date_default_timezone_set('PRC');
	$time = date('Y-m-d-H-i-s');
	$file_name = $path.'/'.$time.'.html';
	$file_pointer = fopen($file_name, "w");
	fwrite($file_pointer, $html);
	fclose($file_pointer);
	//提供一个供jenkens查看的报告链接
	$handle = fopen("$path/index.html", "w");
	fwrite($handle, $html);
	fclose($handle);
}
?>