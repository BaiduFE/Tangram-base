module("baidu.ajax.post");

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
	var urlstring = upath + "notexsistpage.php";
	var arg = "var1=baidu&var2=tangram";
	baidu.ajax.onfailure = function() {
		ok(true, '失败时应该调用这个函数');
		start();
	};
	var xhr = baidu.ajax.post(urlstring, arg, function() {
		fail('success should not be call');
		start();
	});
});

//TODO 大数据量提交校验
//TODO 关于xml类型数据的交互
