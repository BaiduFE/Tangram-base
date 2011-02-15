module("on");
(function(){
	var frameExt = function(fn) {
		// 添加一个frame，自动添加当前测试js及jquery库
		var w = window, doc = w.document, div = doc.body.appendChild(doc
				.createElement('div')), f = div.appendChild(doc
				.createElement('iframe'));
		stop();
		var h = setInterval(function() {
			if (w.frames.length == 1) {
				clearInterval(h);
				ua.importsrc('baidu.event.EventArg', function() {
					fn(w.frames[0]);
				}, 0, 0, w.frames[0]);
			}
			;
		}, 50);
		return {
			finish : function() {
				div.removeChild(f);
				start();
			}
		};
	};
	test("跨iframe加载", function() {
		// 由于当前关于frame下的onload支持问题，修改用例测试使用事件
		var op = frameExt(function(w){
			baidu.on(w.document.body, 'click', function(){
				ok(true, 'event dispatched');
				op.finish();
			});
			$(w.document.body).click();
		});
	});

})();
// 该用例移除，具体参考_eventFilter.mouseenter
// /**
// * UserAction.mouseover模拟事件不能产生relatedTarget变量值，需要手动设置该变量值
// * 情况需要写手工方式产生mouseover事件
// */
// test("test mouseenter filter", function() {
// stop();
// ua.importsrc(
// 'baidu.event._eventFilter,baidu.event._eventFilter.mouseenter',
// function() {
// expect(1);
// var div = document.createElement('div');
// document.body.appendChild(div);
// $(div).css('position', 'absolute').css('left', '0').css('top',
// '0').css('height', '100px').css('width', '100px').css(
// 'background-color', 'blue');
// var listener = function() {
// ok(true, 'mouseenter is triggered ');
// };
// baidu.on(div, 'mouseenter', listener);
//
//				
// ua.mouseover(div, {
// relatedTarget : document.body
// });
// $(div).remove();
// start();
// }, 'baidu.event._eventFilter.mouseenter', 'baidu.event.on');
// });

test("test case sensitive", function() {
	// ok(false, 'TODO: 添加大小写敏感事件的on绑定和un取消用例,比如DOMMouseScroll');
	expect(1);
	var div = document.createElement('div');
	document.body.appendChild(div);
	var listener = function() {
		ok(true, '用DOMNodeInserted测试大小写敏感事件的on绑定');
	};
	baidu.on(div, 'DOMNodeInserted', listener);
	var div1 = document.createElement('div');
	div.appendChild(div1);
	$(div).remove();
});