module('baidu.browser');

/**
 * 根据当前标题可以判断网页是否strict模式
 */
test('isStrict', function() {
	expect(2);
	var urls = window.location.href.split('/');
	var title = urls[urls.length - 1];
	if ("browser_quirk.html" == title
			|| location.search.match("quirk=true") != null) {
		ok(document.compatMode != "CSS1Compat",
				"document.compatMode is not CSS1Compat");
		ok(!baidu.browser.isStrict, "is not strict mode");
	} else if ("browser.html" == title
			|| location.search.match("quirk=true") == null) {
		ok(document.compatMode == "CSS1Compat",
				"document.compatMode is CSS1Compat");
		ok(baidu.browser.isStrict, "is strict mode");
	} else {
		/* 增加批量运行模式支持 */
	}
});