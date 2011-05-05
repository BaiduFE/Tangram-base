module("baidu.async.Deferred");

(function() {
	 window.te  = window.te ||  {};
	/**
	 * @param options
	 *            JSON, [arg(期望校验的值), complex(是否复杂校验)]
	 */
	te.check = function(options, expect) {
		// QUnit.expect(expect);
		// te.expect += expect;
		// ;
		stop();
		var index = options.index || 0,
		// 是否循环校验一组参数
		cycle = options.cycle,
		// 检验方法
		target = options.target || 'success',
		// 期望校验的参数
		arg = cycle ? options.arg[index] : options.arg;
		function async() {
			var defer = new baidu.async.Deferred();
			setTimeout(function() {
				target == 'success' ? defer.success(arg) : defer.fail(arg);
			}, 50);
			return defer;
		}
		var onCheck = function(value) {
			(typeof arg == 'object' ? QUnit.same : QUnit.equals)(arg, value,
					'check return on check');
			if (cycle && index < options.arg.length - 1) {
				options.index = index + 1;
				te.check.call(null, options);
			} else {
				QUnit.start();
			}
		};
		var unCheck = function(value) {
			QUnit.ok(false, 'unexcept called');
			QUnit.start();
		};
		target == 'success' ? async().then(onCheck, unCheck) : async().then(
				unCheck, onCheck);
	};
})();

test("async success", function() {
	te.check(options = {
		arg : [ 'success', '', null, undefined, function() {
		}, {}, [] ],
		cycle : true,
		target : 'success'
	}, 10);
});
test("async fail", function() {
	te.check({
		arg : [ 'fail', '', null, undefined, function() {
		}, {}, [] ],
		cycle : true,
		target : 'fail'
	});
});
test("async cancel 同步调用cancel success ", function() {
	stop();
	var h,asyn;
	function async() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			defer.success("test");
		}, 50);
		return defer;
	}
	asyn = async().then(unExpect, unExpect);
	asyn.cancel();
	function unExpect(value) {
		QUnit.ok(false, value + ' unExpect');
		clearTimeout(h);
		start();
	}
	h = setTimeout(function() {
		QUnit.ok(true, 'canceled');
		start();
	}, 100);
});
test("async cancel 异步调用cancel success ", function() {
	stop();
	var h,asyn;
	function async() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			defer.success("test");
		}, 50);
		return defer;
	}
	asyn = async().then(unExpect, unExpect);
	setTimeout(asyn.cancel(), 40);
	function unExpect(value) {
		QUnit.ok(false, value + ' unExpect');
		clearTimeout(h);
		start();
	}
	h = setTimeout(function() {
		QUnit.ok(true, 'canceled');
		start();
	}, 100);
});
test("async cancel 异步调用切断第二个then", function() {
	stop();
	var h,asyn;
	function async() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			defer.success("test");
		}, 50);
		return defer;
	}
	function expect(value) {
		QUnit.ok(true, 'expect first then');
		setTimeout(50);
	}
	function unExpect(value) {
		QUnit.ok(false, 'unexpect second then');
		clearTimeout(h);
		start();
	}
	asyn = async().then(expect, expect).then(unExpect, unExpect);
	setTimeout(asyn.cancel(), 60);
	
	h = setTimeout(function() {
		QUnit.ok(true, 'first execute and second cancel');
		start();
	}, 120);
});
test("async cancel 超时调用cancel fail", function() {
	stop();
	var h,asyn;
	function async() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			defer.success("test");
		}, 50);
		return defer;
	}
	asyn = async().then(expect, expect);
	setTimeout(function() {
		asyn.cancel();
	}, 80);
	function expect(value) {
		QUnit.ok(true, 'do expect success');
	}
	setTimeout(start, 100);
});
test("async then链测试", function() {
	expect(2);
	stop();
	function async() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			defer.success("test");
		}, 50);
		return defer;
	}
	async().then(expect1, expect1).then(expect2, expect2);
	function expect1(value) {
		QUnit.ok(true, 'expect1 do success');
	}
	function expect2(value) {
		QUnit.ok(true, 'expect2 do success');
	}
	setTimeout(start, 100);
});
test("async then 参数测试只有onSuccess", function() {
	stop();
	function async() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			defer.success("test");
		}, 50);
		return defer;
	}
	async().then(expect);
	function expect(value) {
		QUnit.ok(true, 'expect do success');
	}
	setTimeout(start, 100);
});
test("async then参数中async链情况 01", function() {
	var testResult = [];
	stop();
	function oldAsync() {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			testResult.push("oldAsync");
			defer.success("old");
		}, 50);
		return defer;
	}
	function newAsync(options) {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			testResult.push("newAsync");
			defer.success("new," + options);
		}, 50);
		return defer;
	}

	function oldExpect(value) {
		testResult.push("oldExpect");
	}
	function newExpect(value) {
		testResult.push("newExpect");
	}
	// 做链操作
	oldAsync().then(newAsync().then(newExpect)).then(oldExpect);
	
	// 校验结果
	setTimeout(function() {
		QUnit.same(testResult, [ "oldAsync", "newAsync", "newExpect", "oldExpect" ]
				);
		start();
	}, 120);
});