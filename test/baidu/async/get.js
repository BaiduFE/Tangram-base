module("baidu.async.get");

test("输入正确的url", function() {
	stop();
	var urlstring = upath + "hello.php";
	var defer = baidu.async.get(urlstring);
	defer.then(function(options) {
		QUnit.equal(options.responseText, "Hello World!");
		clearTimeout(teardown);
		start();
	}, function(value) {
		QUnit.ok(false, "unexpect to do this function");
	});
	var teardown = function() {
		setTimeout(QUnit.start, 1000);
	};
});

test("输入错误的url", function() {
	stop();
	var urlstring = upath + "notexist.php";
	var defer = baidu.async.get(urlstring);
	defer.then(function(value) {
		QUnit.ok(false, "unexpect to do this function");
	}, function(obj) {
		QUnit.equal(obj.xhr.status, "404");
		clearTimeout(teardown);
		start();
	});
	var teardown = function() {
		setTimeout(QUnit.start, 1000);
	};
});