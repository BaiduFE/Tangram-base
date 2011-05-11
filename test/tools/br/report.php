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
		$casetime = ($info[4]-$info[3])/1000;
		$time+=$casetime;
		$tests++;
		$failure = (int)($info[0]);
		$case = $suite->appendChild($dom->createElement('testcase'));
		$case->setAttribute("name", $key);
		$case->setAttribute("time", $casetime);
		$case->setAttribute("cov", $info[2]);
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

	if(!is_dir("report"))
	mkdir("report");
	$dom->save("report/{$config['browser']}.xml");
}

//展示覆盖率报告
require_once 'simple_html_dom.php';
if(file_exists("coveragereport/jscoverage.html")){
	$html = file_get_html("coveragereport/jscoverage.html");
}
function covsummaryinfohtml($browser,$info){//生成jscoverage summary 页面的静态页面
	global $html;
	$totals = substr($info[0],1,strlen($info[0])-2);
	$caseinfo = substr($info[1],1,strlen($info[1])-2);
	$summaryTotals = $html->getElementById('summaryTotals');
	$summaryTotals->setAttribute('innertext',$totals);
	$tbody = $html->getElementById('summaryTbody');
	$tbody->setAttribute('innertext',$caseinfo);
	if(is_dir('coveragereport/browser/'.$browser)){
        unlink('coveragereport/browser/'.$browser.'/'.$browser.'.html');
	}
	else mkdir('coveragereport/browser/'.$browser);
	$html->save('coveragereport/browser/'.$browser.'/'.$browser.'.html');
};

function covsourceinfotojs($browser,$info){//每个源码文件对应的html写入到js文件中，封装成一个方法 如get_baidu1ajax1form
	$array = explode("},a", $info);
	$filepath = 'coveragereport/browser/'.$browser.'/'.'source.js';
	if(file_exists($filepath))unlink($filepath);
	$js_content = '';
	foreach($array as $a){
		if(!empty($a)&&$a!=''){
			$title = substr($a,1,strpos($a,':')-4);
			$title = str_replace('/','1',$title);
			$content = substr($a,strpos($a,':')+1,strlen($a));
			$js_content .= "function get_".$title."(){ \n return '".$content."' ; \n}\r\n" ;
		}
	};
	file_put_contents($filepath, $js_content);
};

//function covsourceinfohtml($browser,$info){//生成jscoverage 的source 静态html，
//	$array = explode("},", $info);
//	foreach($array as $a){
//		if(!empty($a)&&$a!=''){
//			$title = substr($a,1,strpos($a,':')-1);
//			$title = str_replace('/','_',$title);
//			$content = substr($a,strpos($a,':')+1,strlen($a));
//			$filepath = 'coveragereport/browser/'.$browser.'/'.$title.'.txt';
//		    if($filepath!=='') file_put_contents($filepath, $content);
//		}
//	};
//};

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