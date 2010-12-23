module("baidu.browser.isWebkit")

test("isWebkit", function() {
	expect(1);
	var browser = navigator.userAgent;
	if (baidu.browser.isWebkit) {
		if (/webkit/i.test(browser))
			ok(true, "this browser is Webkit");
	} else {
		if (!/webkit/i.test(browser))
			ok(true, "this borwser is not Webkit");
	}

})