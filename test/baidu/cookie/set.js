module("baidu.cookie.set");

function remove(key, path) {
	path = path ? (';path=' + path) : '';
	document.cookie = key + '=;expires=' + new Date().toGMTString() + path;
}

test("valid key", function() {
	var key = 's1';
	baidu.cookie.set(key, key);
	ok(document.cookie.match(key + '=' + key), 'set success');
	remove(key);
});

test("valid key with option", function() {
	var key = 's21';
	var r = baidu.cookie.set(key, "百度", {
		path : "\/",
		expires : 10000000
	});
	var res = document.cookie.match(key + "=[^;]+")[0];
	equals(res, key + '=%E7%99%BE%E5%BA%A6', 'raw');
	equals(decodeURIComponent(res), key + "=百度", "decode");
	remove(key, '/');
});

// test("输入非法的key", function() {
// stop();
// expect(2);
// var r = baidu.cookie.set("cookie;test", "百,度", {
// path : "\/",
// domain : "baidu.com",
// expires : 10000000
// });
// ok(baidu.cookie.get("cookie;test") == null, "非法key 'cookie;test' success");
// r = baidu.cookie.set("cookie test", "百,度");
// ok(baidu.cookie.get("cookie test") == null, "非法key 'cookie test'success");
// start();
// });
