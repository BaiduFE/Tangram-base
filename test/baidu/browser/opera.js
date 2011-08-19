module("baidu.browser.opera");

test("opera", function() {
	var b = 'opera';
	ua.browser[b] ? ok(baidu.browser[b], 'should be ' + b) : ok(
			!baidu.browser[b], 'should not be ' + b);
	if(ua.browser[b])
		equals(baidu.browser[b], ua.browser[b], "The version is : " + baidu.browser[b]);
});