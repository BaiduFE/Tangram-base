module("baidu.browser.safari");

test("safari", function() {// chrome貌似会检测出safari的关键字
	expect(1);
	/*
    if (baidu.browser.safari) {
		var browser = navigator.userAgent;
		if ((/(\d+\.\d)(\.\d)?\s+safari/i.test(browser) && !/chrome/i
				.test(browser))) {
			ok(true, "this browser is safari");
		}
	} else {
		if (!(/(\d+\.\d)(\.\d)?\s+safari/i.test(browser) && !/chrome/i
				.test(browser)))
			ok(true, "this browser is not safari");
	}*/
    
    if (baidu.browser.safari) {
		var browser = navigator.userAgent;
        if ((/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(browser) && !/chrome/i.test(browser))) {
			ok(true, "this browser is safari");
		}
	} else {
        if (!(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(browser) && !/chrome/i.test(browser)))
			ok(true, "this browser is not safari");
	}
});
