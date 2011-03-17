<?php
	$frameworks = parse_ini_file('config.ini', true);
	$selectors = file_get_contents('selectors.list');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>js框架评测</title>
	<link rel="stylesheet" type="text/css" href="../images/common.css" />
        <script type="text/javascript" src="../images/tangram.js"></script>
        <script type="text/javascript" src="../images/menu.js"></script>
	<link rel="stylesheet" href="style.css" type="text/css" media="screen">
	<script type="text/javascript">
		<?php
		$selectors = explode("\n", $selectors);
		foreach ($selectors as $i => $selector) {
			if ( $selector && $selector[0] != "#") {
				$list[$i] = "'".$selector."'";
			}
		}
		$list = implode(',', $list);
		echo "window.selectors = [$list]";
		?>
	</script>
	<script src="system/slickspeed.js" type="text/javascript"></script>
</head>
<body>
<?php include('head.php');?>
<div class="f-search">
<div class="info-div">  
<div class="info-bd">
	<div id="chooseTest">
		
			<?php
			$i = 1;
			echo '<table class="static-table static-table-w"><tr>';
			foreach ($selectors as $selector){
				if ( $selector && $selector[0] != "#") {
					echo '<th class="selectors-title"><input type="checkbox" checked = "checked" id="'.$selector.'"/ >';
					$selector = str_replace('%', '', $selector);
					echo '<label for="'.$selector.'">'.$selector.'</label></th>';
					if($i%4 == 0) echo "</tr>";
					$i++;
				}
			}
			echo '</tr></table>';
			
			
	?>
	</div>
	
	
	
	<input type="button" id="start" class="btn-normal" value="开始" />
	<input type="button" id="stop" class="btn-normal" value="停止">
</div>
</div>
</div>
<?php
	function getFileSize($url){  
	 $url = parse_url($url); 
	 if($fp = @fsockopen($url['host'],empty($url['port'])?80:$url['port'],$error)){
	  fputs($fp,"GET ".(empty($url['path'])?'/':$url['path'])." HTTP/1.1\r\n");
	  fputs($fp,"Host:$url[host]\r\n\r\n");
	  while(!feof($fp)){
	   $tmp = fgets($fp);
	   if(trim($tmp) == ''){
		break;
	   }else if(preg_match('/Content-Length:(.*)/si',$tmp,$arr)){
		return trim($arr[1]);
	   }
	  }
	  return null;
	 }else{
	  return null;
	 }
	}
	

	foreach ($frameworks as $framework => $properties){
			echo "<tr>";
			$include = $properties['file'];
			$function = $properties['tests'];
			$time = time();
		
		
		echo "<iframe id='".preg_replace('/[ \.]/', '_', $framework)."' name='$framework' src='system/template.php?include=$include&function=$function&nocache=$time'></iframe>\n\n";
	}
	echo "<iframe id='testFrame' name='testFrame' src=''></iframe>\n\n";
?>
<div id="test" style="">
<table class="static-table" id="testTable">
	<thead id="thead">
		<tr>
			<th class="selectors-title">测试项目(*)</th>
			<?php
				foreach ($frameworks as $framework => $properties){
					$include = $properties['file'];
					$function = $properties['tests'];
					$time = time();
					echo "<th class='framework'>$framework</th>";
				}
			?>
		</tr>
	</thead>
	<tbody id="tbody">
		<?php
			foreach ($selectors as $selector){
				if ( $selector && $selector[0] != "#") {
					echo "<tr>";
					$selector = str_replace('%', '', $selector);
					echo "<th class='selector'>$selector</th>";
					foreach ($frameworks as $framework){
						echo "<td class='empty'></td>";
					}
					echo "</tr>";
				}
			}
			
		?>
	</tbody>
	
	<tfoot id="tfoot">
		<tr>
		<th class="score-title"><strong>时间消耗总计</strong></th>
		<?php
			foreach ($frameworks as $framework){
				echo "<td class='score'>0</td>";
			}
		?>
		</tr>
		<tr>
		<th class="score-title"><strong>引入资源大小</strong></th>
		<?php
			foreach ($frameworks as $framework => $properties){
				$include = $properties['file'];
				$url = split(",",$include);
				$size = 0;
				foreach ($url as $s){
					$pp = "http://".$_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"]."frameworks/".$s; 
					$size = $size+ getFileSize($pp);
				}
				$size = sprintf("%01.1f", $size/1024);

				echo "<td class='score'>$size K</td>";
			}
		?>
		</tr>
	
	</tfoot>
</table>
<table class="static-table" style="margin-left:30px;width:686px;table-layout:fixed">
<caption><h3>性能消耗</h3></caption>
<?php
foreach ($frameworks as $framework => $properties){
$function = $properties['tests'];
$testName = split(" ",$framework);
$testSmallName = $testName[0];
echo "<tr><th style='width:50px'>$framework</th><td class='score' style='text-align:left;padding-left:10px'><div id='".$testSmallName."' class='grow' style='width:1px'></div></td></tr>";
}
?>
</table>

<table class="static-table" style="margin-left:30px;width:686px;table-layout:fixed">
<caption><h3>宽带成本</h3></caption>
<?php
foreach ($frameworks as $framework => $properties){
$include = $properties['file'];
$url = split(",",$include);
$size = 0;
foreach ($url as $s){
$pp =  "http://".$_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"]."frameworks/".$s; 
$size = $size+ getFileSize($pp);
}
$size = sprintf("%01.1f", $size/1024);
$psize = $size/2;

echo "<tr><th style='width:50px'>$framework</th><td class='score' style='text-align:left;padding-left:10px'>$size K <div class='grow' style='width:".$psize."px'></div></td></tr>";
}
?>
</table>





<table class="static-table static-table-w" id="legend">
	<tr>
		<th>最快/基准</th>
		<th>较快</th>
		<th>较慢</th>
		<th>出错</th>
		<th>返回的个数不一致</th>
	</tr>
	<tr>
		<td class="best"></td>
		<td class="good"></td>
		<td class="bad"></td>
		<td class="exception"></td>
		<td class="mismatch"></td>
	</tr>
</table>
</div>
</div>
</body>


</html>
