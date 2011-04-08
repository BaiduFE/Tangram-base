<?php
//经常碰到傲游和IE6同时完成的情况，如何处理比较合适？
//TODO add php info in xml
if(substr_count($_POST['config'], "browser")==0){
	echo "report only create if browser is set\n\r<br />";
	return;
}

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
		covHtml($config['browser'].'/'.$key,$info[2]);
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

	if(!is_dir("report"))
	mkdir("report");
	$dom->save("report/{$config['browser']}.xml");
}

require_once 'simple_html_dom.php';
$htmlstr = "<html><head><meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
<style>td, th {border: 1px solid white;}</style></head><body><div>
<h2 align='center'>覆盖率结果</h2>
<table id='table' cellspacing='0' style='border: 1px solid black; color: #fff; background-color: #0d3349; text-shadow: rgba(0, 0, 0, 0.5) 2px 2px 1px; text-align: center;'>
<thead><tr><th rowspan='2'>用例名称</th><th rowspan='2'>总覆盖率</th></tr></thead></table></div></body></html>";

if(file_exists("covreport.html")){
	$html = file_get_html("covreport.html");
}
else $html = str_get_html($htmlstr);
function covHtml($name,$cov){
	global $html;
	$table = $html->find('table',0);
	$tableInner = $table->innertext();
	$color = '#710909';
	$trs = $tableInner."<tr><td>$name</td><td style='background-color:$color'>$cov%</td></tr>";
	$table->setAttribute('innertext',$trs);
	$html->save('covreport.html');
};

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