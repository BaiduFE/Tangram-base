<?
function cov_merge(){
	//整合覆盖率文档到单一文档，需确认所有浏览器完成相关操作后进行
	$doc_cases = new DOMDocument('1.0', 'UTF-8');
	$dom_cases = $doc_cases->appendChild($doc_cases->createElement('cases'));

	//追加一个记录所有浏览器信息的节点，用于在展现结果时关联外部文件
	$browsers = $dom_cases->appendChild($doc_cases->createElement('browsers'));

	$cases = array();

	//载入文件
	require_once 'config.php';
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
}

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
?>