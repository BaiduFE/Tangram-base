<?php
function generateXML($post, $server) {
	$dom = new DOMDocument('1.0', 'utf-8');
	$report = $dom->appendChild($dom->createElement('report'));

	require_once 'config.php';
	$cfg = preg_split('/[&=]/', $_POST['config']);
	$b = '';
	foreach($cfg as $key=>$item){
		if($item == 'browser'){
			$b = $cfg[$key + 1];
			break;
		}
	}
	if($b == '')
	return;

	foreach ($post as $kiss => $info) {
		if ($kiss == 'config')
		continue;
		$testResult = $report->appendChild($dom->createElement('testResult'));
		$caseName = $testResult->appendChild($dom->createAttribute('caseName'));
		$testResult->setAttribute('caseName', $kiss);
		$browser = $testResult->appendChild($dom->createAttribute('browserInfo'));
		//		$testResult->setAttribute('browserInfo', $server['HTTP_USER_AGENT']);
		$testResult->setAttribute('browserInfo', $b);
		$host = $testResult->appendChild($dom->createAttribute('hostInfo'));
		//		$testResult->setAttribute('hostInfo', $server['REMOTE_ADDR']);
		$testResult->setAttribute('hostInfo', Config::$BROWSERS[$b][0]);

		$result = explode(",", $info); //拆分
		$failNumber = $testResult->appendChild($dom->createAttribute('failNumber'));
		$testResult->setAttribute('failNumber', $result[0]);
		$totalNumber = $testResult->appendChild($dom->createAttribute('totalNumber'));
		$testResult->setAttribute('totalNumber', $result[1]);
		$testResult->setAttribute('cov',$result[2]);
	}
	if (!file_exists('report')) {
		mkdir('report');
	}
	$dom->save('./report/' . $b . '.xml');
}

/**
 * 追加接口参数，支持过滤成功用例
 * @param unknown_type $onlyfails
 */
function interXML($onlyfails = false) {
	if(!file_exists('report'))
	return array();
	$fs = scandir('report');
	require_once 'config.php';
	foreach (Config :: $BROWSERS as $b => $machine) {
		if (!Config::$DEBUG && !in_array($b . '.xml', $fs)) {
			print "none browser xml exist $b";
			return;
		}
	}
	$caseList = array ();
	foreach ($fs as $f) {
		if (substr($f, 0, 1) == '.')
		continue;
		$xmlFile = simpleXML_load_file("report/$f");

		foreach ($xmlFile as $testResult) {
			//			$totalCov = 0;
			$browser = $testResult['browserInfo'];
			$host = $testResult['hostInfo'];
			$caseName = $testResult['caseName']; //得到用例名称
			settype($caseName, "string"); //$caseName本来类型为object，需要做转换
			$fail = $testResult['failNumber'];
			$total = $testResult['totalNumber'];
			$cov = $testResult['cov'];
			settype($browser, "string");
			settype($host, "string");
			settype($fail, "string");
			settype($total, "string");
			settype($cov, "float");

			if (!array_key_exists($caseName, $caseList)) { //如果这个用例不存在
				$caseInfo = array (
					'hostInfo' => $host,
					'fail' => $fail,
					'total' => $total,
					'cov' => $cov
				);
				//				$totalCov += $cov;
				$caseList[$caseName] = array (
				$browser => $caseInfo//,
				//				'totalCov'=>$totalCov
				);

				//				$caseList['totalCov'] = $totalCov;
			} else { //否则添加到相应的用例中去
				$foundCase = $caseList[$caseName]; //找到用例名称对应的array，$caseName为key
				if (!array_key_exists($browser, $foundCase)) { //如果没有该浏览器信息，则添加
					//					$totalCov += $cov;
					$caseList[$caseName][$browser] = array (
						'hostInfo' => $host,
						'fail' => $fail,
						'total' => $total,
						'cov' => $cov
					);
					//					$caseList[$caseName]['totalCov'] = $totalCov;
				} else {
					$foundBrowser = $foundCase[$browser]; //有这个浏览器
					array_push($foundBrowser, array (
						'hostInfo' => $host,
						'fail' => $fail,
						'total' => $total,
						'cov' => $cov
					));
				}
			}

		}
//		unlink("report/$f");
	}

	//根据需求添加仅记录失败情况的接口
	if($onlyfails){//如果仅考虑失败情况，此处根据用例情况过滤
		foreach($caseList as $name => $info){
			$all_success = true;//记录当前用例是否全部运行成功
			foreach($info as $b => $result){
				if($result['fail'] > 0)
				$all_success = false;//如果有失败情况则终止循环并进入下一个用例分析
				break;
			}
			//if($all_success) //如果全部通过则从记录中移除
			//unset($caseList[$name]);
		}
	}
	//rmdir("report");
	return $caseList;
}
?>