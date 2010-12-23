module("baidu.cookie.get");
function remove(key){
	document.cookie = key+'=;expires='+new Date().toGMTString();
}
test("输入合法的key", function() {
	expect(2);
	document.cookie = "g11=g1";
	equals(baidu.cookie.get("g11"), "g1",
			"get success");
	remove('g11');
	document.cookie = "g12=" + encodeURIComponent("bai du.");
	equals(baidu.cookie.get("g12"), "bai du.",
			"get encode success");
	remove('g12');
});

test("key not valid", function() {
	expect(4);
	equals(baidu.cookie.get("TANGRAM_Cookie;baidu"), null,
			"非法key 'TANGRAM_Cookie;baidu' success");
	equals(baidu.cookie.get("TANGRAM_Cookie,baidu"), null,
			"非法key 'TANGRAM_Cookie,baidu'success");
	equals(baidu.cookie.get("TANGRAM_Cookie baidu"), null,
			"非法key 'TANGRAM_Cookie baidu'success");
	equals(baidu.cookie.get("TANGRAM_Cookie@baidu"), null,
			"非法key 'TANGRAM_Cookie@baidu'success");
});

test("key not exist", function() {
	equals(baidu.cookie.get("TANGRAM_Cookie_notexisist"), null,
			"不存在的key success");
});
