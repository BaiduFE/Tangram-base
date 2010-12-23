module("baidu.ajax.post");

test("正确url和正确data", function() {
	stop();
	expect(1);
	var asyncDelay = 10000;
	var urlstring = upath + "post.php";
	var arg = "var1=baidu&var2=tangram";
	var xhr = baidu.ajax.post(urlstring, arg);
	var check = function() {
		return xhr.responseText.length > 0;
	}, onsuccess = function() {
		equals(xhr.responseText, "baidutangram", "xhr return");
		start();
	}, onfail = function() {
		fail('timeout wait for reponse text in 10 seconds');
		start();
	};
	ua.delayhelper(check, onsuccess, onfail);
});

test("onsuccess", function() {
	stop();
	expect(2);
	var asyncDelay = 200;
	var urlstring = upath + "post.php";
	var arg = "var1=baidu&var2=tangram";
	function successAction(xhr, text) {
		equals(text, "baidutangram", "check text");
		equals(xhr.responseText, "baidutangram", "check xhr response text");
		start();
	}
	var xhr = baidu.ajax.post(urlstring, arg, successAction);
});

test("输入不存在url以及设定onsuccess事件", function() {
	stop();
	var asyncDelay = 2000;
	var urlstring = upath + "notexsistpage.php";
	var arg = "var1=baidu&var2=tangram";
	var xhr = baidu.ajax.post(urlstring, arg, function() {
		fail('success should not be call');
	});
	ua.delayhelper(function() {
		return xhr.responseText.length > 0;
	}, function() {
		ok(xhr.responseText.indexOf('404') >= 0, 'response text contain 404!');
		start();
	});
});

//参数错误引发的服务器端异常，设计用例无意义
//test("输入正确url以及错误data，设定onsuccess事件", function() {
//	stop();
//	expect(1);
//	var urlstring = upath + "post.php";
//	var arg = "var1=baidu&var9=tangram";
//	var xhr = baidu.ajax.post(urlstring, arg, function() {
//		fail('success should not be call');
//	});
//	ua.delayhelper(function() {
//		return xhr.responseText.length > 0;
//	}, function() {
//		console.log(xhr.responseText);
//		ok(xhr.responseText.indexOf('404') >= 0, 'response text contain 404!');
//		start();
//	});
//});
