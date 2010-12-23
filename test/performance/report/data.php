<?php
function browser_info($agent=null) { 
        $userAgent = strtolower($agent ? $agent : $_SERVER['HTTP_USER_AGENT']); 

        // Identify the browser. Check Opera and Safari first in case of spoof. Let Google Chrome be identified as Safari. 
        if (preg_match('/opera/', $userAgent)) { 
            $name = 'opera'; 
        } 
        elseif (preg_match('/webkit/', $userAgent)) { 
            $name = 'safari'; 
        } 
        elseif (preg_match('/msie/', $userAgent)) { 
            $name = 'msie'; 
        } 
        elseif (preg_match('/mozilla/', $userAgent) && !preg_match('/compatible/', $userAgent)) { 
            $name = 'mozilla'; 
        } 
        else { 
            $name = 'unrecognized'; 
        } 

        // What version? 
        if (preg_match('/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/', $userAgent, $matches)) { 
            $version = $matches[1]; 
        } 
        else { 
            $version = 'unknown'; 
        } 

        // Running on what platform? 
        if (preg_match('/linux/', $userAgent)) { 
            $platform = 'linux'; 
        } 
        elseif (preg_match('/macintosh|mac os x/', $userAgent)) { 
            $platform = 'mac'; 
        } 
        elseif (preg_match('/windows|win32/', $userAgent)) { 
            $platform = 'windows'; 
        } 
        else { 
            $platform = 'unrecognized'; 
        } 

        return array( 
            'browser'      => $name, 
            'version'   => $version, 
            'platform'  => $platform, 
            'userAgent' => $userAgent 
        ); 
    }

?>
<?php
	// call php data.php > results.json to get an up-to-date local copy of a the 
	// "master" results. Or adjust the save-results endpoint in slickspeed.js,
	// and use that as the $data url.
	
	// this is the "master" collected data. Adjust for your own purposes.
	$data = file("../results.dat");

	$results = array();	
	
	foreach($data as $line){
		// wow, really?
		$d = json_decode(stripslashes(unserialize($line)));
		$results[] = $d;
	}

	$total_tests = count($results);
	
	// the results by browser
	$byBrowser = getBaseData($results);
	$uas = array_keys($byBrowser["browsers"]);
	
	$counts = array();
	$perbrowser = array();
	
	foreach($uas as $browser){
		// just to see how good of coverage each browser got
		$tests = $byBrowser["browsers"][$browser]["tests"];
		$counts[$browser] = count($tests);
		
		if(!is_array($perbrowser[$browser])){
			$perbrowser[$browser] = array();
		}
		
		foreach($tests as $test){
			foreach($test as $library => $score){
				if(!is_array($perbrowser[$browser][$library])){
					$perbrowser[$browser][$library] = array();
					$perbrowser[$browser][$library]['total'] = 0;
					$perbrowser[$browser][$library]['average'] = 0;
				}
				$perbrowser[$browser][$library]['total'] += $score;
			}
		}
	}
	
	foreach($perbrowser as $browser => $libs){
		foreach($libs as $lib => $part){
			$perbrowser[$browser][$lib]['average'] = $part['total'] / $counts[$browser];
		}
	}

	$out = array(
		"counts" => $counts,
		"byBrowser" => $perbrowser,
		"everything" => $byBrowser
	);

	
	function  createJson($data){
		$FileName = "results.json";
		if( ($TxtRes=fopen ($FileName,"w+")) === FALSE){
			echo($FileName."创建失败,请检查php环境配置"); 
			exit();
		}
		 $StrConents = json_encode($data);
		 if(!fwrite ($TxtRes,$StrConents)){
			echo (TxtFileName."写入失败！请检查配置");
			fclose($TxtRes);
			exit();   
		}
		echo ("正在生成报表,请稍后......");
		fclose ($TxtRes); 
		echo "<script type='text/javascript'>"."location.href='charts.html'"."</script>";
	}
	
	createJson($out);
	
	function getBaseData($data){
		
		$ret = array();
		$totals = array();
		$averages = array();
		$libs = array();
		$platforms = array();
		
		foreach($data as $item){
			
			// find out which browser this test was run in.
			$ua = $item -> ua;
			$ua = browser_info($ua);
			$b = $ua["browser"] . " " . $ua["version"];
			
			// man i wished php give you easier shorthands :)
			// $platforms[$p] = $platforms[$p] ? $platforms[$p]++ : 0;
			$p = $ua["platform"];

			if(empty($platforms[$p])){
				$platforms[$p] = 0;
			}
			$platforms[$p]++;
			
			$scores = $item -> scores;
			
			// build up the array
			if(!is_array($ret[$b])){
				$ret[$b] = array();
				if(!is_array($ret[$b]["tests"])){
					$ret[$b]["tests"] = array();
				}
			}
			
			// do a cumulative count for each library across all browsers
			foreach($scores as $library => $score){
				if(!in_array($library, $libs)){
					$libs[] = $library;
				}
				if(empty($totals[$library])){
					$totals[$library] = 0;
					$averages[$library] = 0;
				}
				$totals[$library] += $score;
			}
			
			// stash the full results for each browser test
			$ret[$b]['tests'][] = $scores;
		}
		
		// reduce the totals to averages
		foreach($totals as $lib => $total){
			$averages[$lib] = $totals[$lib] / count($data);
		}
		
		// give back the "sorted" data
		return array(
			"browsers" => $ret,
			"totals" => $totals,
			"averages" => $averages,
			"libraries" => $libs,
			"platforms" => array_unique($platforms)
		);
	}

?>
