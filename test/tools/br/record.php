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
	$_mails = explode('mail=', $_POST['config']);
	if(sizeof($_mails)==2){
		require_once 'smail.php';
		sendmail($html, true);
	}

	if(!$debug){
		require_once 'config.php';
		Config::StopAll();
	}
}
?>