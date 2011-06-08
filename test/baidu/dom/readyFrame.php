<?php header("Content-type: text/html; charset=utf-8");
?>
<html>
<head>
<style type="text/css">
* {
	margin: 0;
	padding: 0;
}
</style>
<?php
$release = preg_match('/release=true/i', $_SERVER['QUERY_STRING']);
if($release == 0 && array_key_exists('f', $_GET))
print "<script type='text/javascript' src='../../tools/br/import.php?f={$_GET['f']}'></script>";
else
print "<script type='text/javascript' src='../../../release/all_release.js'></script>";
?>
<script>
parent&&parent.frameload && parent.frameload(window);
</script>
</head>
<body>
	<div>
		<img src="../page/test.jpg" /> <img src="../page/test.jpg" /> <img
			src="../page/test.jpg" />
	</div>
</body>
</html>
