module("baidu.event.unload");
test("取消注册unload事件", function() {
	stop();
	ua.importsrc('baidu.event.on', function(){
		expect(1);
		var handle_a = function() {
			ok(true, "check unload");
		};
		var div = document.createElement('div');
		document.body.appendChild(div);
		baidu.on(div, "onclick", handle_a);
		/* 直接调用UserAction提供的接口跨浏览器接口，屏蔽浏览器之间的差异 */
		UserAction.click(div);
		baidu.un(div, "click", handle_a);
		UserAction.click(div);
		document.body.removeChild(div);
		start();
	}, 'baidu.event.on', 'baidu.event.un');
});

/**
 * 跨frame on然后un
 */
test("window resize", function() {
	expect(1);
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200);
		},
		ontest : function(w, f) {
			var op = this;
			var fn = function() {
				ok(true);
			};
			baidu.on(w, 'resize', fn);
			$(f).css('width', 220);
			/* 貌似通过jquery触发窗体变化会存在延时 */
			setTimeout(function(){
				baidu.un(w, 'resize', fn);
				$(f).css('width', 240);
				op.finish();
			}, 500);
		}
	});
});
