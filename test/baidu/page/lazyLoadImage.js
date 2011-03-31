module("baidu.page.lazyLoadImage");

test("base", function() {
//	if(ua.browser.ie){
//		ok(true, "IE下不干活……");
//		return;
//	};
	expect(4);
	
	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	$(iframe).css('height', 200).css('width', 200);
	stop();
	iframe.src = upath + 'lli.php';
	
	setTimeout(function() {
		equals(frames[0].document.getElementById("test_img").src, "",
				"图片链接被替换为空");
		frames[0].scroll(0, 20);
	}, 200);
	setTimeout(function() {
		equals(frames[0].document.getElementById("test_img").src, "",
				"图片不显示时链接依然为空");
		frames[0].scroll(0, 200);
		setTimeout(function(){
			ok(frames[0].document.getElementById("test_img").src
					.indexOf("test.jpg") >= 0, "图片显示时链接更新");
			start();
		}, 200);
	}, 500);
});