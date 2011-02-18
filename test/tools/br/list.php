<?php
header("Content-type: text/html; charset=utf-8");
$filter = array_key_exists('filter', $_GET) ? $_GET['filter'] : '*';
$quirk = array_key_exists('quirk', $_GET);
if(!$quirk){?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<?php }?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Tangram Test Index Page</title>
<script type="text/javascript" src="../jquery-1.3.2.js"></script>
<script type="text/javascript" src="js/run.js"></script>
<link media="screen" href="../tangramtest.css" type="text/css"
	rel="stylesheet" />
</head>
<body>
<div id="title">
<h1>Tangram Test Index Page</h1>
</div>
<div id="id_control" class="control"><input id="id_control_runnext"
	type="checkbox" />自动下一个 <input id="id_control_breakonerror"
	type="checkbox" />出错时终止<input id='id_control_hidelist' type='checkbox' checked="checked"/>运行时折叠用例<input
	id="id_control_clearstatus" type="button" value="清除用例状态"
	onclick="$('.testlist a').removeClass('running_case pass_case fail_case');" />
</div>
<div id="id_testlist_srconly" class="testliststatus"
	style="display: none"
	onclick="$('#id_showSrcOnly').slideToggle('slow');"
	style="float: left; clear: both;<?php 
	$str = $_SERVER['QUERY_STRING'];
	if(!preg_match("/showsrconly=true/i",$str)){
	?> display:none
	<?php
	}
	?>">遗漏用例</div>
<div id="id_showSrcOnly" class="testlist" style="clear: both;"><?php 
require_once "case.class.php";
$str = $_SERVER['QUERY_STRING'];
if(preg_match("/showsrconly=true/i",$str))
foreach(Kiss::listSrcOnly() as $showsrc){
	?><a><?php echo str_replace("/", ".", $showsrc);?></a><?php
}
?>
<div style="clear: both;"></div>
</div>
<div class="testliststatusbar">
<div id="id_testlist_status" class="testliststatus"
	onclick="$('#id_testlist').slideToggle('slow');" style="float: left"
	title="">用例目录</div>
<i>点击展开或者隐藏用例</i></div>
<div id="id_rerun" onclick="run($('#id_rerun').html());return false;"></div>
<div style="clear: both"></div>
<div id="id_testlist" class="testlist"><?php 
/*分析所有源码与测试代码js文件一一对应的文件并追加到当前列表中*/
require_once "case.class.php";
Kiss::listcase($filter);
?>
<div style="clear: both; overflow: hidden"></div>
</div>
<div id="id_runningarea" class="runningarea"
	style="border: solid; display: none"></div>
<div id="id_reportarea" class="reportarea" style="display: none"></div>

</body>
</html>
