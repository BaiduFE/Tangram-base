module("baidu.cookie.remove");
test("valid key", function() {
	document.cookie = "testCookieR11=11";
	baidu.cookie.remove("testCookieR11");
	ok(document.cookie.match('testCookieR11=') == null, 'delete success');
	document.cookie = "testCookieR12=1%201";
	baidu.cookie.remove("testCookieR12");
	ok(document.cookie.match('testCookieR12=') == null, 'delete success');
});

test("delete key with option", function() {
	document.cookie = "testCookieR21=21;path=/tangram/";
	baidu.cookie.remove("testCookieR21");
	ok(document.cookie.match('testCookieR21=') == null, 'delete fail without options');
	baidu.cookie.remove("testCookieR21", {
		path : '/tangram/'
	});
	ok(document.cookie.match('testCookieR21=') == null, 'delete success with options');
});

test('key not exist', function() {
	var len = document.cookie.indexOf('=');
	ok(!document.cookie.match('testCookieR31='), 'key not exist');
	baidu.cookie.remove('testCookieR31');
	equals(document.cookie.indexOf('='), len, 'cookie not changed');
});
//
// test("输入不存在的key", function() {
// baidu.cookie.remove("testCookieR31");
// });
