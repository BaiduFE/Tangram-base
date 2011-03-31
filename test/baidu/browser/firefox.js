module("baidu.browser.firefox");

test("firefox", function() {
	var b = 'firefox';
	ua.browser[b] ? ok(baidu.browser[b], 'should be ' + b) : ok(
			!baidu.browser[b], 'should not be ' + b);
});