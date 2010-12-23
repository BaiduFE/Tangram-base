module("baidu.browser.ie")

test("ie", function() {
	expect(1);
	if (baidu.browser.ie) {
		var browser = navigator.userAgent;
		if (/msie (\d+\.\d)/i.test(browser))
			ok(true, "this browser is ie");
	} else {
		if (!/msie (\d+\.\d)/i.test(browser))
			ok(true, "this borwser is not ie");
	}

})