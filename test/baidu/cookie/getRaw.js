module("baidu.cookie.getRaw");
function remove(key) {
	document.cookie = key + '=;expires=' + new Date().toGMTString();
}
test("输入合法的key", function() {
	var key = 'gr11';
	document.cookie = key + '=' + encodeURIComponent("百度");
	var res = baidu.cookie.getRaw(key);
	equals(res, '%E7%99%BE%E5%BA%A6', 'raw');
	equals(decodeURIComponent(res), "百度", "decode");
	remove(key);
});

test("输入非法的key", function() {
	equals(baidu.cookie.getRaw("TANGRAM_Cookie;baidu"), null, "非法key success");
	equals(baidu.cookie.getRaw("TANGRAM_Cookie,baidu"), null, "非法key success");
	equals(baidu.cookie.getRaw("TANGRAM_Cookie baidu"), null, "非法key success");
	equals(baidu.cookie.getRaw("TANGRAM_Cookie@baidu"), null, "非法key success");
});

//test("輸入不存在的key", function() {
//	equals(baidu.cookie.getRaw("TANGRAM_Cookie_notexisist"), null,
//			"不存在的key success");
//});