
<?php
$debug = false;
//$debug = false;
/*非批量运行*/
//if (!file_exists('report')) {
//	if (!$debug)
//	return;
//	else
//	mkdir('report');
//}

//if ($debug)
//print "browser : $b \r\n";
require_once 'geneXML.php';
generateXML($_POST, $_SERVER);

/*如果全部运行完毕，发送邮件*/
$kissList = interXML(true);
require_once 'geneHTML.php';
if(sizeof($kissList)>0){
	//针对kissList过滤，移除全部正确用例
	
	$html =	geneHTML($kissList);
	require_once 'geneHistory.php';
	geneHistory($html);
	$config = $_POST['config'];
	$r = new Request($config);
	if($r->contain('mail')){
		require_once 'smail.php';
		sendmail($html, true);
	}

	if(!$debug){
		require_once 'lib/Staf.php';
		Staf::process('stop all confirm', '10.81.23.218');
		Staf::process('stop all confirm', '10.81.23.219');
		Staf::process('stop all confirm', '10.81.23.220');
		Staf::process('free all', '10.81.23.218');
		Staf::process('free all', '10.81.23.219');
		Staf::process('free all', '10.81.23.220');
	}
}
?>