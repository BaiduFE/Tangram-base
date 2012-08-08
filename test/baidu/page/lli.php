<?php
header("Cache-Control: no-cache; ALL: no-store;");
header("Content-Type: text/html; charset=utf-8");
print '<html>
	<script type="text/javascript" src="../../tools/br/import.php?f=baidu.page.lazyLoadImage"></script>
	<script type="text/javascript">
	baidu.page.lazyLoadImage({	
		onlazyload : function(){
			parent.ok(true, "onload dispatch");
			window.onLoadImage = true;
		}
	});
	</script>
<body>
<div style="width: 250px; height: 250px;"></div>
<div><img id="test_img" src="test.jpg" style="width: 1920px; height: 1200px;" /></div>
</body>
</html>';
?>

