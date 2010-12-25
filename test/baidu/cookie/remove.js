module("baidu.cookie.remove");
test("valid key", function() {
	document.cookie = "r11=11";
	baidu.cookie.remove("r11");
	ok(document.cookie.match('r11=') == null, 'delete success');
	document.cookie = "r12=1%201";
	baidu.cookie.remove("r12");
	ok(document.cookie.match('r12=') == null, 'delete success');
});

test("delete key with option", function() {
	document.cookie = "r21=21;path=/tangram/";
	baidu.cookie.remove("r21");
	ok(document.cookie.match('r21=') == null, 'delete fail without options');
	baidu.cookie.remove("r21", {
		path : '/tangram/'
	});
	ok(document.cookie.match('r21=') == null, 'delete success with options');
});

test('key not exist', function() {
	var len = document.cookie.indexOf('=');
	ok(!document.cookie.match('r31='), 'key not exist');
	baidu.cookie.remove('r31');
	equals(document.cookie.indexOf('='), len, 'cookie not changed');
});
//
// test("输入不存在的key", function() {
// baidu.cookie.remove("r31");
// });
