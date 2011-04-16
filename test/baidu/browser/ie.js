module("baidu.browser.ie");

test("ie", function() {
	var b = 'ie';
	ua.browser[b] ? ok(baidu.browser[b], 'should be ' + b) : ok(
			!baidu.browser[b], 'should not be ' + b);
});