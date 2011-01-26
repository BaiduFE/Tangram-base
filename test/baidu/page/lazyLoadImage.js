module("baidu.page.lazyLoadImage");

test("base", function() {
	expect(1);
	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	$(iframe).css('height', 200).css('width', 200);
	stop();
	iframe.src = upath + 'lli.php?type=html';
	setTimeout(function() {
		iframe.contentWindow.scroll(0, 20);
	}, 100);
	setTimeout(function() {
		iframe.contentWindow.scroll(0, 200);
	}, 200);
});