module("baidu.browser.opera")

test("opera", function() {
	expect(1);
	var browser = navigator.userAgent;
	if (baidu.browser.opera) {
		if (/opera\/(\d+\.\d)/i.test(browser))
			ok(true, "this browser is opera");
	} else {
		if (!/opera\/(\d+\.\d)/i.test(browser))
			ok(true, "this borwser is not opera");
	}

})