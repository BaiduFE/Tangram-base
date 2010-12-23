module('baidu.dom.getTarget');
(function() {
	var on = function(element, type, fn) {
		if (element.addEventListener) {
			element.addEventListener(type, fn, false);
		} else if (document.body.attachEvent) {
			element.attachEvent('on' + type, fn);
		}
	};
	var un = function(element, type, fn) {
		if (element.removeEventListener) {
			element.removeEventListener(type, fn, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + type, fn);
		}
	};
	
	test('dom', function() {
		expect(1);
		var callback = function(e) {
			equal(div, baidu.event.getTarget(e), 'target is div');
		};
		var div = document.createElement('div');
		document.body.appendChild(div);
		on(div, 'click', callback);
		UserAction.click(div);
		un(div, 'click', callback);
		document.body.removeChild(div);
	});

	/***************************************************************************
	 * document不能直接派发click事件，因为document是一个抽象的东西，用户不可能会对它直接派发事件，
	 * 而所有事件的click事件都会冒泡到document上,选择在document上注册，在body上派发*
	 **************************************************************************/
	test('document,click',
			function() {
				expect(1);
				var callback = function(e) {
					e = e || window.event;
					equal(document.body, baidu.event.getTarget(e),
							'target is document');
				};
				on(document, 'click', callback);
				UserAction.click(document.body);
				un(document, 'click', callback);
			});

	test('document,keypress',
			function() {
				expect(1);
				var i = 0;
				var handle = function(e) {
					equal(document.body, baidu.event.getTarget(e),
							'target is document');
				};
				on(document, 'keypress', handle);
				UserAction.fireKeyEvent('keypress', document.body, {
					'keyCode' : 8
				});// backspace
			un(document, 'keypress', handle);
			UserAction.fireKeyEvent('keypress', document.body, {
				'keyCode' : 8
			});// backspace
		});
})();
