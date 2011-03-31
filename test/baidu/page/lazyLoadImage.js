module("baidu.page.lazyLoadImage");

test("base", function() {
	// if(ua.browser.ie){
	// ok(true, "IE下不干活……");
	// return;
	// };
	expect(3);

	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	$(iframe).css('height', 200).css('width', 200);
	stop();
	iframe.src = upath + 'lli.php';
	var h = setInterval(function() {
		if (frames[0] && frames[0].document
				&& frames[0].document.getElementById("test_img")
				&& frames[0].document.getElementById("test_img").src == '') {
			// 标签就位，
			clearInterval(h);
			var step = 0;
			baidu.on(frames[0], 'scroll', function() {
				if (step == 0) {
					ok(this.document.getElementById("test_img").src
							.indexOf("test.jpg") == -1, "图片不会显示");
					step = 1;
					frames[0].scroll(0, 200);					
				} else {
					ok(this.document.getElementById("test_img").src
							.indexOf("test.jpg") >= 0, "图片显示链接更新");
					start();
				}
			});
			frames[0].scroll(0, 20);
		}
	}, 50);

});