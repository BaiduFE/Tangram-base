<?php

function report(){
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
	//TODO add php info in xml

	if(!array_key_exists("browser", $config)){
		echo "report only create if browser is set\n\r<br />";
		return;
	}

	$suite->setAttribute("name", $config['browser']);
	$errors = 0;
	$failures = 0;
	$tests = 0;
	$time = 0;
	foreach($_POST as $key=>$value){
		if($key == 'config')
		continue;

		$info = explode(",", $value);

		//errornum + ',' + allnum + ','+ kissPerc || 0 + ',' + wb.kissstart + ','+ wb.kissend;
		$casetime = ($info[4]-$info[3])/1000;
		$time+=$casetime;
		$tests++;
		$failure = (int)($info[0]);
		$case = $suite->appendChild($dom->createElement('testcase'));
		$case->setAttribute("name", $key);
		$case->setAttribute("time", $casetime);
		$case->setAttribute("cov", $info[2]);
		if($failure > 0)$failures++;
		$failinfo = $case->appendChild($dom->createElement('failure'));
		$failinfo->setAttribute('type', 'junit.framework.AssertionFailedError');
		//FROM php.net, You cannot simply overwrite $textContent, to replace the text content of a DOMNode, as the missing readonly flag suggests.
		$failinfo->appendChild(new DOMText($value));

		//TODO add more case info in xml
	}

	$suite->setAttribute('time', $time);
	$suite->setAttribute('failures', $failures);
	$suite->setAttribute('tests', $tests);

	if(!is_dir("report"))
	mkdir("report");
	$dom->save("report/{$config['browser']}.xml");
}

report();
include 'config.php';
$dom = new DOMDocument('1.0', 'utf-8');
$testsuites = $dom->appendChild($dom->createElement('testsuites'));
foreach (Config::$BROWSERS as $key=>$value){
	$file = "report/$key.xml";
	if(!file_exists($file)){
		echo "wait for report : $file\r\n<br />";
		return;
	}
	$xmlDoc = new DOMDocument('1.0', 'utf-8');
	$xmlDoc->load($file);
	$xmlDom = $xmlDoc->documentElement;
	//echo $xmlDom->nodeName;
	$testsuites->appendChild($dom->importNode($xmlDom, true));
}
$dom->save("report.xml");

Config::StopAll();
?>