<?php
header("Content-type: text/html; charset=utf-8");
header("Cache-Control: no-cache, max-age=10, must-revalidate");
//经常碰到傲游和IE6同时完成的情况，如何处理比较合适？
//TODO add php info in xml
if(substr_count($_POST['config'], "browser")==0){
	echo "report only create if browser is set\n\r<br />";
	return;
}

include 'config.php';
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
Config::StopAll();
?>
