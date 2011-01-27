module('baidu.sio.callByServer');

test('callback is function', function() {
	stop();
	var check = function(text) {
		equals(text, 'i am from server');
		start();
	};
	baidu.sio.callByServer(upath + "callByServer.php", check);
});

test('callback is string', function() {
	stop();
	window.check_string = function(text) {
		equals(text, 'i am from server');
		start();
	};
	baidu.sio.callByServer(upath + "callByServer.php", "check_string");
});

test('charset utf-8', function() {
	stop();
	var check = function(text) {
		equals(text, '百度中文--UTF');
		start();
	};
	baidu.sio.callByServer(upath + "callByServerCharset_UTF.php", check, {
		charset : "UTF-8"
	});
});

test('charset gbk', function() {
	stop();
	var check = function(text) {
		equals(text, '百度中文--GBK');
		start();
	};
	baidu.sio.callByServer(upath + "callByServerCharset_GBK.php", check, {
		charset : "GBK"
	});
});

// modify by bell, 貌似短期没有修改计划，尚未实现
//test('确保所有动态创建的script都被删除了', function() {
////	start();
////	var head = document.getElementsByTagName('HEAD')[0];
//	var scripts = document.getElementsByTagName('SCRIPT');
//	for ( var i = 0, j = scripts.length; i < j; i++) {
//		if (scripts[i].src) {
//			equal(scripts[i].src.indexOf('callback=') == -1, true ,scripts[i].src);
//		}
//	}
//});

test('throw exception in callback', function() {
	stop();
	var check = function() {
		ok(true);
		throw new Error("custom exception");
	};
	baidu.sio.callByServer(upath + "callByServer.php", check);
	setTimeout(function() {
		start();
	}, 500);
});

/**
 * 由于不存在网页不会触发回调，设置半秒超时，用例可能会有问题……
 */
test('page not exist', function() {
	stop();
	var h, check = function(text) {
		clearTimeout(h);
		ok(false, 'call back will not call');
		start();
	};
	baidu.sio.callByServer("notexist.php", check);
	h = setTimeout(function() {
		ok(true, 'call back not call');
		start();
	}, 500);
});

test(
		'html with none head',
		function() {
			var f = document.body.appendChild(document.createElement('iframe'));
			f.src = (upath || '') + 'nonehead.html';
			stop();
			$(f)
					.ready(
							function() {
								equals(frames[0].document
										.getElementsByTagName('head').length,
										1,
										'html with none head could get elements by tag name head');
								setTimeout(function() {
									$(f).remove();
									start();
								}, 1);
							});
		});