<?php
header("Cache-Control: no-cache; ALL: no-store;");
header("Content-Type: text/html; charset=utf-8");
print '<html>
    <script src="../../../src/baidu.js" type="text/javascript"></script>
    <script src="../../../src/baidu/page.js" type="text/javascript"></script>
    <script src="../../../src/baidu/page/getScrollTop.js" type="text/javascript"></script>
    <script src="../../../src/baidu/page/getViewHeight.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/g.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/getDocument.js" type="text/javascript"></script>
    <script src="../../../src/baidu/lang.js" type="text/javascript"></script>
    <script src="../../../src/baidu/lang/isString.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/_g.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/getComputedStyle.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/_styleFixer.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/_styleFilter.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/_styleFilter/filter.js" type="text/javascript"></script>
    <script src="../../../src/baidu/string.js" type="text/javascript"></script>
    <script src="../../../src/baidu/string/toCamelCase.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/getStyle.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser/ie.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser/opera.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser/isWebkit.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser/isGecko.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser/isStrict.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/getPosition.js" type="text/javascript"></script>
    <script src="../../../src/baidu/browser/safari.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/ready.js" type="text/javascript"></script>
    <script src="../../../src/baidu/string/trim.js" type="text/javascript"></script>
    <script src="../../../src/baidu/dom/hasClass.js" type="text/javascript"></script>
    <script src="../../../src/baidu/event.js" type="text/javascript"></script>
    <script src="../../../src/baidu/event/_listeners.js" type="text/javascript"></script>
    <script src="../../../src/baidu/event/on.js" type="text/javascript"></script>
    <script src="../../../src/baidu/event/un.js" type="text/javascript"></script>
    <script src="../../../src/baidu/lang/isFunction.js" type="text/javascript"></script>
    <script src="../../../src/baidu/page/lazyLoadImage.js" type="text/javascript"></script>
    
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

