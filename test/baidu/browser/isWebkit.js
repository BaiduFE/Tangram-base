module("baidu.browser.isWebkit");

test("isWebkit", function() {
	var b = 'Webkit';
	ua.browser[b.toLowerCase()] ? ok(baidu.browser['is' + b], 'should be ' + b)
			: ok(!baidu.browser['is' + b], 'should not be ' + b);
});