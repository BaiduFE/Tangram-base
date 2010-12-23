module("baidu.cookie.setRaw");

function remove(key, path) {
	path = path ? (';path=' + path) : '';
	document.cookie = key + '=;expires=' + new Date().toGMTString() + path;
}

test("valid key", function() {
	var key = 'sr1';
	baidu.cookie.setRaw(key, key);
	ok(document.cookie.match(key + '=' + key), 'set success');
	remove(key);
});

test("valid key with option", function() {
	var key = 'sr2', value = '%E7%99%BE%E5%BA%A6';
	var r = baidu.cookie.setRaw(key, value, {
		path : "\/",
		expires : 10000000
	});
	var res = document.cookie.match(key + "=[^;]+")[0];
	equals(res, key + '=%E7%99%BE%E5%BA%A6', 'raw');
	equals(decodeURIComponent(res), key + "=百度", "decode");
	remove(key, '/');
});

//    "输入非法的key": function(){
//        r = baidu.cookie.setRaw("cookie;test", "百,度", {
//            path: "\/",
//            domain: "baidu.com",
//            expires: 5000000
//        });
//        value_of(baidu.cookie.get("cookie;test")).should_be_null();
//        
//        r = baidu.cookie.setRaw("cookie test", "百,度");
//        value_of(baidu.cookie.getRaw("cookie test")).should_be_null();
//    }
//});
