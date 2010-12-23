module("baidu.browser.isGecko")

test("isGecko", function() {
	expect(1);
	var browser = navigator.userAgent;
	if (baidu.browser.isGecko) {
		if (/gecko/i.test(browser) && !/like gecko/i.test(browser))
			ok(true, "this browser is Gecko");
	} else {
		if (!(/gecko/i.test(browser) && !/like gecko/i.test(browser)))
			ok(true, "this borwser is not Gecko");
	}

})