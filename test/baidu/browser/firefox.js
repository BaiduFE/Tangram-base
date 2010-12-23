module("baidu.browser.firefox")

test("firefox", function() {
	expect(1);
	if (baidu.browser.firefox) {
		var browser = navigator.userAgent;
		if (/firefox\/(\d+\.\d)/i.test(browser)) {
			ok(true, "this browser is firefox");
		}
	} else {
		if (!/firefox\/(\d+\.\d)/i.test(browser))
			ok(true, "this borwser is not firefox");
	}

})