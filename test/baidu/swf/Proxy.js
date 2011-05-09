module("baidu.swf.Proxy");

test("normal", function(){
	ok(true, '这个用例的执行会阻塞IE，使CPU直接到100%，暂时屏蔽，修改的同学注意打开用例执行');
});

//这个用例的执行会阻塞IE，使CPU直接到100%，暂时屏蔽，修改的同学注意打开用例执行
//test("normal", function() {
//	stop();
//	var isrc = "baidu.swf.create,baidu.ajax.get,baidu.json.decode".split(',');
//	ua.importsrc(isrc.join(','),
//			function() {
//				var div = document.createElement('div');
//				div.id = 'FlashContainer';
//				document.body.appendChild(div);
//				baidu.swf.create({
//					id : "Line",
//					url : upath + "line.swf",
//					width : "100%",
//					height : "165",
//					wmode : "transparent",
//					errorMessage : "载入FLASH出错",
//					ver : "9.0.0",
//					allowscriptaccess : "always"
//				}, "FlashContainer");
//
//				function flashLoaded() {
//					baidu.ajax.get(upath + 'two_line.json', function(xhr) {
//						var data = baidu.json.decode(xhr.responseText);
//						if (data) {
//							var isready = proxy.isReady();
//							ok(isready, "ready ok");
//							proxy.call("setFlashLineData", data, 1);
//							ok(true, "call ok");
//						}
//						setTimeout(function() {
//							document.body.removeChild(div);
//						}, 200);
//						start();
//					});
//				}
//				var proxy = new baidu.swf.Proxy("Line", "setFlashLineData",
//						flashLoaded);
//			}, isrc[0], 'baidu.swf.Proxy');
//});
