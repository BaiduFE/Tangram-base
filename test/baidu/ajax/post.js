module("baidu.ajax.post");

test("正确url和正确data", function() {
	stop();
	expect(1);
	var asyncDelay = 10000;
	var urlstring = upath + "post.php";
	var arg = "var1=baidu&var2=tangram";
	var xhr = baidu.ajax.post(urlstring, arg);
	var check = function() {
		// IE下面遇到了"完成该操作所需的数据还不可使用。"的错误
		return xhr.responseText && xhr.responseText.length > 0;
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

/**
 * 之前的校验方式采用超时，更新为使用全局的失败函数，貌似重复注册会有覆盖情况，暂不考虑
 */
test("输入不存在url以及设定onsuccess事件", function() {
	stop();
	var urlstring = upath + "notexsistpage.php";
	var arg = "var1=baidu&var2=tangram";
	//注册一个全局fail
	baidu.ajax.onfailure = function(){
		//这是个全局函数，实际上，post本身并不提供这个接口，而，全局返回失败时
		ok(true, '失败时应该调用这个函数');
		start();
	};
	var xhr = baidu.ajax.post(urlstring, arg, function() {
		fail('success should not be call');
	});
});

// 参数错误引发的服务器端异常，设计用例无意义
// test("输入正确url以及错误data，设定onsuccess事件", function() {
// stop();
// expect(1);
// var urlstring = upath + "post.php";
// var arg = "var1=baidu&var9=tangram";
// var xhr = baidu.ajax.post(urlstring, arg, function() {
// fail('success should not be call');
// });
// ua.delayhelper(function() {
// return xhr.responseText.length > 0;
// }, function() {
// console.log(xhr.responseText);
// ok(xhr.responseText.indexOf('404') >= 0, 'response text contain 404!');
// start();
// });
// });
