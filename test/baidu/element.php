<?php

/**
 * 获取dom下所有接口的列表返回
 */
$path = '../../src/baidu/dom';
$fs = scandir($path);
$start = true;
foreach($fs as $f){

	$c = substr($f, 0, 1);
	if($c == '.' || $c == '_')
	continue;
	if(is_dir($path.'/'.$f))
	continue;
	if($start){
		$start = false;
	}else
	print ' ';
	print substr($f, 0, -3);
}
?>