module("baidu.browser.isGecko");

test("isGecko", function() {
	var b = 'Gecko';
	ua.browser[b.toLowerCase()] ? ok(baidu.browser['is' + b], 'should be ' + b)
			: ok(!baidu.browser['is' + b], 'should not be ' + b);
});