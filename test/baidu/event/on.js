module("on");

test("跨iframe加载", function() {
	expect(1);
	var op = {
		jsfilt : [],
		onafterstart : function(f) {
			baidu.on(f, 'load', function() {
				ok(true, 'on load of iframe success');
			});
		},
		ontest : function() {
			this.finish();
		}
	};
	ua.frameExt(op);
});

/**
 * UserAction.mouseover模拟事件不能产生relatedTarget变量值，需要手动设置该变量值
 * 情况需要写手工方式产生mouseover事件
 */
test("test mouseenter filter", function() {
	stop();
	ua.importsrc(
			'baidu.event._eventFilter,baidu.event._eventFilter.mouseenter',
			function() {
				expect(1);
				var div = document.createElement('div');
				document.body.appendChild(div);
				$(div).css('position', 'absolute').css('left', '0').css('top',
						'0').css('height', '100px').css('width', '100px').css(
						'background-color', 'blue');
				var listener = function() {
					ok(true, 'mouseenter is triggered ');
				};
				baidu.on(div, 'mouseenter', listener);

				ua.mouseover(div, {
					relatedTarget : document.body
				});
				$(div).remove();
				start();
			}, 'baidu.event._eventFilter.mouseenter', 'baidu.event.on');
});
