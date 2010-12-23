module("baidu.browser.maxthon");

test("maxthon", function() {
	ua.importsrc("baidu.browser.opera,baidu.browser.safari", function() {
		if (baidu.browser.maxthon) {
			if (/(\d+\.\d)/.test(external.max_version))
				ok(true, "this browser is maxthon");
		} else if (baidu.browser.safari || baidu.browser.opera) {
			ok(true, 'this is safari or opera');
		} else {
			if (!/(\d+\.\d)/.test(external.max_version))
				ok(true, "this browser is not maxthon");
		}
	}, 'baidu.browser.safari', 'baidu.browser.maxthon');

});
