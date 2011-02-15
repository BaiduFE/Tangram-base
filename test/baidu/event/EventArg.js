module("baidu.event.EventArg");
(function() {
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

	/**
	 * stop = preventDefault + stopPropagation
	 */
	test('stop = preventDefault + stoppropagation', function() {
		expect(3);
		var op = frameExt(function(w) {
			var doc = w.document, div = doc.body.appendChild(doc
					.createElement('div')), div1 = doc.body.appendChild(doc
					.createElement('div')), a = div1.appendChild(doc
					.createElement('a')), nobubbled = true;
			div.style.height = 2000;
			a.href = '#';
			a.innerHTML = 'ToTop_arg';
			a.target = '_self';
			doc.body.appendChild(a);
			w.scrollTo(0, doc.body.scrollHeight);
			$(div1).bind('click', function() {
				nobubbled = false;
			});
			$(a).bind('click', function(e) {
				ok(true, '事件派发了');
				(new w.baidu.event.EventArg(e)).stop();
			});
			$(a).click();
			var top = w.pageYOffset || doc.documentElement.scrollTop
					|| doc.body.scrollTop || 0;
			ok(top != 0, "默认行为应该被阻止");
			ok(nobubbled, '事件不应该冒泡');
			op.finish();
		});

	});
})();