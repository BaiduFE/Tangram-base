<?php
require_once 'config.php';
//加入一个调试开关
if(array_key_exists('debug', $_GET))
Config::$DEBUG = true;
if(!Config::$DEBUG){
	header("Content-type: text/javascript; charset=utf-8");
	header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
}
/*
 * Tangram
 * Copyright 2009 Baidu Inc. All rights reserved.
 *
 * path: import.php
 * author: berg
 * version: 1.0
 * date: 2010/07/18 23:57:52
 *
 * @fileoverview * import.js的php版本
 * 接受一个f参数，格式和import.js相同，自动合并js并输出
 * 此外，本脚本支持引入一个包所有文件（其实也就是一个目录下的所有js文件，**不递归**）
 * IE下，get请求不能超过2083字节，请注意。
 */
$cov = array_key_exists('cov', $_GET) ? $_GET['cov'] : false;
$f = explode(',', $_GET['f']);//explode() 函数把字符串分割为数组,此处$f=baidu.ajax.form
$e = (array_key_exists('e', $_GET) && $_GET['e']!='') ? explode(",", $_GET['e']) : array();
require_once 'analysis.php';
$analysis = new Analysis();
$IGNORE = array();
foreach ($e as $d){
	if(Config::$DEBUG)var_dump($d);
	$IGNORE = array_merge($IGNORE, array_keys($analysis->get_import_srcs($d)));
}
if(Config::$DEBUG)var_dump($IGNORE);

function importSrc($d, $cov=false){
	global $IGNORE;
	foreach($IGNORE as $idx=>$domain)
	if($domain == $d)
	return "";
	array_push($IGNORE, $d);
	$ccnt = Analysis::get_src_cnt($d, $cov);
	return preg_replace("/\/\/\/import\s+([\w\-\$]+(\.[\w\-\$]+)*);?/ies", "importSrc('\\1')", $ccnt['c']);
}
//update by bell 2011-03-25, 更新覆盖率相关逻辑
if(!$cov){
	$cnt = "";
	foreach($f as $d){
		$cnt.=importSrc($d, $cov);
	}
	echo $cnt;
}else{
	$IMPORT_LIST = array();
	foreach($f as $d){
		if(Config::$DEBUG)var_dump($d);
		$IMPORT_LIST = array_merge($IMPORT_LIST, array_keys($analysis->get_import_srcs($d)));
	}
	if(Config::$DEBUG) var_dump('after analysis', $IMPORT_LIST);
	else foreach($IMPORT_LIST as $d) {
		if(array_search($d, $IGNORE))
		continue;
		$c = Analysis::get_src_cnt($d);
		echo $c['cc']."\n";
	}
}
?>