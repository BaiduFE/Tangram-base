module("baidu.browser.safari")

test("safari", function() {
	expect(1);
	if (baidu.browser.safari) {
		var browser = navigator.userAgent;
		if ((/(\d+\.\d)(\.\d)?\s+safari/i.test(browser) && !/chrome/i.test(browser))) {
			ok(true, "this browser is safari");
		}
	} else {
		if (!(/(\d+\.\d)(\.\d)?\s+safari/i.test(browser) && !/chrome/i.test(browser)))
			ok(true, "this borwser is not safari");
	}

})