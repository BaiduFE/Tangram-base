<?php
header("Content-type: text/html; charset=utf-8");
header("Cache-Control: no-cache, max-age=10, must-revalidate");
//经常碰到傲游和IE6同时完成的情况，如何处理比较合适？
//TODO add php info in xml
if(substr_count($_POST['config'], "browser")==0){
	echo "report only create if browser is set\n\r<br />";
	return;
}

include('config.php');
/**
 * for junit report
 */
$dom = new DOMDocument('1.0', 'utf-8');
$suite = $dom->appendChild($dom->createElement('testsuite'));
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
$suite->setAttribute("total_coverage", $config['total_coverage']);
$errors = 0;
$failures = 0;
$tests = 0;
$time = 0;
foreach($_POST as $key=>$value){
	echo "<a>$key</a><br />";
	if($key == 'config')
	continue;
	if($key == 'covsummaryinfo'){//此方法生成summary页面
		$array = explode("、", $value);//preg_split('/[,]/', $value);
		covsummaryinfohtml($config['browser'],$array);
		continue;
	};
	if($key == 'covsourceinfo'){//此方法生成source 存储文件
		covsourceinfotojs($config['browser'],$value);
		continue;
	};

	$info = explode(",", $value);

	//errornum + ',' + allnum + ','+ kissPerc || 0 + ',' + wb.kissstart + ','+ wb.kissend;
	$casetime = ($info[3]-$info[2])/1000;
	$time+=$casetime;
	$tests++;
	$failure = (int)($info[0]);
	$case = $suite->appendChild($dom->createElement('testcase'));
	$case->setAttribute("name", $key);
	$case->setAttribute("time", $casetime);
	$case->setAttribute("cov", $info[4]);
	$case->setAttribute("fail", $info[0]);
	$case->setAttribute("total", $info[1]);
	//		covHtml($config['browser'].'/'.$key,$info[2]);
	if($failure > 0){
		$failures++;
		$failinfo = $case->appendChild($dom->createElement('failure'));
		$failinfo->setAttribute('type', 'junit.framework.AssertionFailedError');
		//FROM php.net, You cannot simply overwrite $textContent, to replace the text content of a DOMNode, as the missing readonly flag suggests.
		$failinfo->appendChild(new DOMText($value));
	}
	//TODO add more case info in xml
}

$suite->setAttribute('time', $time);
$suite->setAttribute('failures', $failures);
$suite->setAttribute('tests', $tests);
if(array_key_exists($config['browser'], Config::$BROWSERS)){
	$host = Config::$BROWSERS[$config['browser']][0];
	$suite->setAttribute('hostname', $host);
}
$dom->save(Config::$REPORT_TEST_PATH."{$config['browser']}.xml");

//整合覆盖率文档到单一文档，需确认所有浏览器完成相关操作后进行
$dom_suites = new DOMDocument('1.0', 'UTF-8');
$suites = $dom_suites->appendChild($dom_suites->createElement('testsuites'));
foreach (Config::$BROWSERS as $key=>$value){
	$file = Config::$REPORT_TEST_PATH."$key.xml";
	if(!file_exists($file)){
		$info =  "wait for test report : $file";
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
$dom_suites->save(Config::$REPORT_TEST_PATH."html/reports.xml");

function mergeCase($cases, $dom_case){
	$name = $dom_case->getAttribute('name');
	if(!array_key_exists($name, $cases))
	$cases[$name] = array();
	$lines = $dom_case->getElementsByTagName('line');
	for($index = 0; $index < $lines->length; $index++){
		$node_line = $lines->item($index);
		$line = $node_line->getAttribute('line');
		$num = $node_line->getAttribute('number');
		if(array_key_exists($line, $cases[$name]) && $cases[$name][$line] == '1')
		continue;
		$cases[$name][$line] = $num;
	}
	return $cases;
}

//整合覆盖率文档到单一文档，需确认所有浏览器完成相关操作后进行
$doc_cases = new DOMDocument('1.0', 'UTF-8');
$dom_cases = $doc_cases->appendChild($doc_cases->createElement('cases'));
//追加一个记录所有浏览器信息的节点，用于在展现结果时关联外部文件
$browsers = $dom_cases->appendChild($doc_cases->createElement('browsers'));
$cases = array();
foreach (Config::$BROWSERS as $key=>$value){
	$file = Config::$REPORT_COVERAGE_PATH."cov_$key.xml";
	//如果某个浏览器没完事就退出先
	if(!file_exists($file)){
		$info = "wait for report : $key";
		error_log($info);
		echo $info;
		return;
	}
	$xmlDoc = new DOMDocument('1.0', 'utf-8');
	$xmlDoc->load($file);
	$xmlDom = $xmlDoc->documentElement;
	$_dom_cases = $xmlDoc->getElementsByTagName('case');
	for($index = 0; $index < $_dom_cases->length; $index++){
		$cases = mergeCase($cases, $_dom_cases->item($index));
	}

	$browsers->appendChild($doc_cases->createElement('browser', $key));
}

foreach ($cases as $name=>$case){
	echo "$name $case \r\n";
	$dom_case = $dom_cases->appendChild($doc_cases->createElement('case'));
	$dom_case->setAttribute('name', $name);
	foreach($case as $line=>$number){
		echo "$line $number \r\n";
		$dom_line = $dom_case->appendChild($doc_cases->createElement('line'));
		$dom_line->setAttribute('line', $line);
		$dom_line->setAttribute('number', $number);
	}
}
$doc_cases->save(Config::$REPORT_COVERAGE_PATH."html/cov_cases.xml");

Config::StopAll();
?>
