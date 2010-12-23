module("baidu.ajax.get");

test("输入正确的url", function() {
	stop();
	var urlstring = upath + "hello.php";
	var xhr = baidu.ajax.get(urlstring);
	ua.delayhelper( {
		oncheck : function() {
			return xhr.readyState != 1 && xhr.responseText.length > 0;
		},
		onsuccess : function() {
			equals(xhr.responseText, "Hello World!", "xhr return");
			start();
		}
	});
});

test("输入正确的url，设定onseccess", function() {
	stop();
	var urlstring = upath + "hello.php";
	var xhr = baidu.ajax.get(urlstring, function(xhr, text){
		equals(xhr.responseText, "Hello World!", "xhr return");
		equals(text, "Hello World!", "xhr return");
	});
	ua.delayhelper( {
		oncheck : function() {
			return xhr.readyState != 1 && xhr.responseText.length > 0;
		},
		onsuccess : function() {
			start();
		}
	});
});

test("输入不存在url以及设定onsuccess事件", function() {
	stop();
	var urlstring = upath + "notexsistpage.php";
	var xhr = baidu.ajax.get(urlstring, function(xhr, text){
		fail('onsuccess should not exec');
	});
	ua.delayhelper( {
		oncheck : function() {
			return xhr.readyState != 1 && xhr.responseText.length > 0;
		},
		onsuccess : function() {
			ok(xhr.responseText.indexOf('404')>=0, 'responseText should contain 404');
			start();
		}
	});
});
