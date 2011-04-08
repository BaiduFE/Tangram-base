module("baidu.browser.opera");

test("opera", function() {
	var b = 'opera';
	ua.browser[b] ? ok(baidu.browser[b], 'should be ' + b) : ok(
			!baidu.browser[b], 'should not be ' + b);
});