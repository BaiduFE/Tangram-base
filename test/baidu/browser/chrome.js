module("baidu.browser.chrome");

test("chrome", function() {
	var b = 'chrome';
	ua.browser[b] ? ok(baidu.browser[b], 'should be ' + b) : ok(
			!baidu.browser[b], 'should not be ' + b);
});