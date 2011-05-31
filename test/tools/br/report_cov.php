<?php
header("Content-type: text/html; charset=utf-8");
header("Cache-Control: no-cache, max-age=10, must-revalidate");
/**
 * 实现一个记录单一浏览器覆盖率的接口
 * 提供一个整合所有浏览器覆盖率信息的逻辑
 * 记录结果存储到独立的不被清理的环境中并提供两个版本之间的比较功能
 */
if(substr_count($_POST['config'], "browser")==0){
	echo "report only create if browser is set\n\r<br />";
	return;
}

$dom = new DOMDocument('1.0', 'utf-8');
//FIXME 追加xml校验用dtd文件头
$suite = $dom->appendChild($dom->createElement('coveragesuite'));
$cfg = preg_split('/[&=]/', $_POST['config']);
$config = array();
for($i = 0; $i < sizeof($cfg); $i+=2){
	//	echo "{$cfg[$i]} {$cfg[$i+1]}\r\n<br />";
	$config[$cfg[$i]] = $cfg[$i+1];
	$p = $suite->appendChild($dom->createElement("property"));
	$p->setAttribute('name', $cfg[$i]);
	$p->setAttribute('value', $cfg[$i+1]);
}
$suite->setAttribute("name", $config['browser']);

foreach($_POST as $case => $covinfo){
	if($case == 'config')
	continue;
	// casename  :  per-1:20|2:20|3:20
	$covinfos = split('\|', $covinfo);
	//var_dump($covinfo);
	//var_dump($covinfos);
	$dom_case = $dom->createElement("case");
	$dom_case->setAttribute('name', $case);
	$dom_case->setAttribute('percent', $covinfos[0]);
	$suite->appendChild($dom_case);
	$lineinfo = split(',', $covinfos[1]);
	foreach ($lineinfo as $line => $info){
		$infos = split(':', $info);
		if(sizeof($infos)!=2)
		continue;
		$dom_line = $dom->createElement('line');
		$dom_line->setAttribute('line', $infos[0]);
		$dom_line->setAttribute('number', $infos[1]);
		$dom_case->appendChild($dom_line);
	}
}
require_once 'config.php';
//存储数据到xml文件
$covfile = Config::$REPORT_COVERAGE_PATH."cov_{$config['browser']}.xml";
$covfile_history = Config::$REPORT_COVERAGE_PATH_HISTORY."cov_{$config['browser']}.xml";
if(file_exists($covfile)){
	if(!file_exists(Config::$REPORT_COVERAGE_PATH_HISTORY))
	mkdir(Config::$REPORT_COVERAGE_PATH_HISTORY);
	//上一次执行的覆盖率信息存入history
	copy($covfile, $covfile_history);
}
$dom->save($covfile);

require_once 'report_cov_merge.php';
cov_merge();
?>