/**
 * 重载QUnit部分接口实现批量执行控制功能
 */
(function() {
	if (!QUnit)
		return;
	var ms = QUnit.moduleStart, d = QUnit.done;
	function _ms(args /* name, testEnvironment */) {
		if (parent && parent.brtest)
			parent.brtest.starttime = new Date().getTime();
	}

	function _d(args /* failures, total */) {
		if (parent && parent.brtest) {
			var pKiss = parent.brtest.kiss;
			var wbkiss = parent.brtest.kisses[pKiss];
			parent.$(parent.brtest).trigger(
					'done',
					[ new Date().getTime(), args[0],
							window._$jscoverage || null ]);
		}
	}
	QUnit.moduleStart = function() {
		stop();
		/* 为批量执行等待import.php正确返回 */
		var h = setInterval(function() {
			if (window && window['baidu']) {
				clearInterval(h);

				_ms(arguments);
				ms.apply(this, arguments);

				start();
			}
		}, 20);
	};
	QUnit.done = function() {
		_d(arguments);
		d.apply(this, arguments);
	};
})();