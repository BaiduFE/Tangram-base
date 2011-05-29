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
if(!file_exists(Config::$REPORT_COVERAGE_PATH."history")){
mkdir(Config::$REPORT_COVERAGE_PATH."history", 0777, true);
echo 'mkdir : '.Config::$REPORT_COVERAGE_PATH."history";
}
//存储数据到xml文件
$covfile = Config::$REPORT_COVERAGE_PATH."cov_{$config['browser']}.xml";
$covfile_history = Config::$REPORT_COVERAGE_PATH."history/cov_{$config['browser']}.xml";
if(file_exists($covfile)){
	//上一次执行的覆盖率信息存入history
	copy($covfile, $covfile_history);
}
$dom->save($covfile);

//整合覆盖率文档到单一文档，需确认所有浏览器完成相关操作后进行
$dom_suites = new DOMDocument('1.0', 'UTF-8');
$suites = $dom_suites->appendChild($dom_suites->createElement('coveragesuites'));
foreach (Config::$BROWSERS as $key=>$value){
	$file = Config::$REPORT_COVERAGE_PATH."/cov_$key.xml";
	if(!file_exists($file)){
		$info =  "wait for report : $file";
		error_log($info);
		echo $info;
		return;
	}
	$xmlDoc = new DOMDocument('1.0', 'utf-8');
	$xmlDoc->load($file);
	$xmlDom = $xmlDoc->documentElement;
	//echo $xmlDom->nodeName;
	$suites->appendChild($dom_suites->importNode($xmlDom, true));
	//$dom->dom
}
$dom_suites->save(Config::$REPORT_COVERAGE_PATH."/html/reports.xml");
?>