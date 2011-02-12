module("baidu.page.lazyLoadImage");

test("base", function() {
	expect(4);
	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	$(iframe).css('height', 200).css('width', 200);
	stop();
	iframe.src = upath + 'lli.php?type=html';
	setTimeout(function() {
		equals(iframe.contentDocument.getElementById("test_img").src, "",
				"图片链接被替换为空");
		iframe.contentWindow.scroll(0, 20);
	}, 100);
	setTimeout(function() {
		equals(iframe.contentDocument.getElementById("test_img").src, "",
				"图片不显示时链接依然为空");
		iframe.contentWindow.scroll(0, 200);
		ok(iframe.contentDocument.getElementById("test_img").src
				.indexOf("test.png") >= 0, "图片显示时链接更新");
	}, 200);
});