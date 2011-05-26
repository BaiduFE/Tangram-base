/**
 * 重载QUnit部分接口实现批量执行控制功能
 */
(function() {
	if (!QUnit)
		return;
	var ms = QUnit.moduleStart, d = QUnit.done, td = QUnit.testDone, ts = QUnit.testStart;

	function _d(args /* failures, total */) {
		// 默认展开失败用例
		$('li.fail ol').toggle();
		if (parent && parent.brtest) {
			parent.$(parent.brtest).trigger('done', [ new Date().getTime(), {
				failed : args[0],
				passed : args[1]
			}, window._$jscoverage || null ]);
		}
		// 追加新版本的支持兼容
		if (parent && parent.TRunner) {
			parent.TRunner.done(args[0], args[0] + args[1], _$jscoverage);
		}
	}

	QUnit.moduleStart = function() {
		stop();
		/* 为批量执行等待import.php正确返回 */
		var h = setInterval(function() {
			if (window && window['baidu']) {
				clearInterval(h);
				ms.apply(this, arguments);
				start();
			}
		}, 20);
	};
	QUnit.done = function() {
		_d(arguments);
		d.apply(this, arguments);
	};

	QUnit.testDone = function() {
		td.apply(this, arguments);
	};
})();
