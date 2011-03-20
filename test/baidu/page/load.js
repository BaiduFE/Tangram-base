module("baidu.page.load");
var path = (upath || "");
test("加载资源", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	div.id = "css";
	var arr = [ 0, 0, 0 ];
	baidu.page.load([ {
		url : path + "css.css",
		onload : function(w, n) {
			setTimeout(function() {
				ok($(div).css('display') == 'none', 'load css');
				$(div).remove();
				arr[0] = 1;
			}, 100);
		}
	}, {
		url : path + "jsfile1.js",
		onload : function(w, n) {
			ok(typeof loadedTest1 == 'function', 'load js');
			ok(loadedTest1() == 1, 'load js and run ok');
			arr[1] = 1;
		}
	}, {
		url : path + "test.html",
		onload : function(text) {
			/* load html by ajax */
			ok(text.indexOf('<title>test</title>') > 0, 'load html');
			arr[2] = 1;
		}
	} ]);
	var handle = setInterval(function() {
		if (arr[0] && arr[1] && arr[2]) {
			clearInterval(handle);
			start();
		}
	}, 10);
});

test("类型参数的有效性", function() {
	stop();
	expect(3);
	var ops = [ {
		url : path + "a.php?file=a.css&type=css&opt=0",
		type : 'css',
		onload : function() {
			setTimeout(function() {
				equals(step++, 2, "css loaded 1st");
				start();
			}, 100);
		}
	}, {
		url : path + "a.js",//"a.php?file=a.js&type=js&opt=1",//opera支持的php下面js读取貌似有问题，改成js文件
		type : 'js',
		onload : function() {
			equals(step++, 0, "js loaded 2nd");
		}
	}, {
		url : path + "a.php?file=a.html&type=html&opt=2",
		type : 'html',
		onload : function() {
			equals(step++, 1, "html loaded 3rd");
//			start();
		}
	} ];
	var old = {
		onload : function() {
			equals(step, 3, '最后调用这个步骤');
		}
	};
	var step = 0;
	baidu.page.load(ops, old || {});
});

//
// test("不存在的资源", function() {
// stop();
// baidu.page.load([ {
// url : path + "notexist.js",
// requestType : 'ajax',
// onload : function(reponse) {
//			
// start();
// }
// } ]);
// });

test("js支持charset设置", function() {
	stop();
	expect(1);
	baidu.page.load([ {
		url : path + 'jsgbk.js',
		charset : 'gbk',
		onload : function() {
			equals(testGBK(), '百度', '校验charset在js情况下');
			start();
		}
	} ]);
});

test("第一个参数是url", function() {
	stop();
	expect(2);
	baidu.page.load(path + "jsfile2.js");
	ua.delayhelper(function() {
		return loadedTest2 && typeof loadedTest2 == 'function';
	}, function() {
		ok(loadedTest2() == 2, '一个参数的情况');
		start();
	});
});

test("并行", function() {
	stop();
	var step = 0;
	var ops = [ {
		url : path + "b.css",
		onload : function() {
			ok(true, "css at " + step++);
		}
	}, {
		url : path + "b.js",
		onload : function() {
			ok(true, "js at " + step++);
		}
	}, {
		url : path + "b.html",
		onload : function() {
			ok(true, "html at " + step++);
		}
	} ];
	baidu.page.load(ops, {
		parallel : true,
		onload : function() {
			ok(step <= 3, '并行');
		}
	});
	ua.delayhelper(function() {
		return step == 3;
	}, function() {
		start();
	});
});