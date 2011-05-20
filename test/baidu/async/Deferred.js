module("baidu.async.Deferred");

(function() {
	window.te = window.te || {};
	/**
	 * @param options JSON, [arg(期望校验的值), complex(是否复杂校验)]
	 */
	te.check = function(options, expect) {
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
				target == 'success' ? defer.resolve(arg) : defer.reject(arg);
			}, 20);
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

	te.validate = function(value) {
		// 记录调用index
		var _index = 0;
		return {
			/**
			 * 对测试初始化
			 * 
			 * @returns
			 */
			init : function() {
				QUnit.stop();
				_index = 0;
			},
			/**
			 * @param expIdx 期望Index
			 * @param timeout 超时时间
			 * @returns 返回一个Function对象
			 */
			getFn : function(expIdx, timeout) {
				var fn = expIdx || expIdx === 0 ? function() {
					equals(_index++, expIdx, expIdx + 'st call');
				} : function() {
				};
				return (timeout && timeout > 0) ? setTimeout(fn, timeout) : fn;
			},
			/**
			 * @param expIdx 期望的Index
			 * @param isFail 是否调用OnFail链
			 * @returns 返回Deferred对象
			 */
			getDef : function(expIdx, isFail) {
				equals(_index++, expIdx, expIdx + 'st call');
				var def = new baidu.async.Deferred();
				setTimeout(isFail ? def.reject : def.resolve, 20);
				return def;
			},
			/**
			 * 对测试调用结束
			 * 
			 * @returns
			 */
			teardown : function(timeout) {
				delete _index;
				timeout && timeout != 0 ? timeout : 200;
				setTimeout(QUnit.start, 200);
			}
		};
	};
})();

test("async resolve", function() {
	te.check(options = {
		arg : [ 'success', '', null, undefined, function() {
		}, {}, [] ],
		cycle : true,
		target : 'success'
	}, 10);
});
test("async reject", function() {
	te.check({
		arg : [ 'fail', '', null, undefined, function() {
		}, {}, [] ],
		cycle : true,
		target : 'fail'
	});
});
test("async cancel 同步调用cancel success ", function() {
	QUnit.expect(1);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).then(tv.getFn(-1)).cancel();
	tv.teardown();
});
test("async cancel 异步调用cancel success ", function() {
	QUnit.expect(1);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).then(function () {setTimeout(tv.getFn(-1), 30);}).cancel();
	tv.teardown();
});
// 该用例当内部defer对象cancel掉后不应该影响外部def对象的then？还是直接全部cancel
test("async cancel 切断内部defer对象", function() {
	expect(2);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).then(function() {
		var def = tv.getDef(1).then(tv.getFn(-1));
		def.cancel();
		return def;
	}).then(-1);
	tv.teardown();
});

test("async cancel 切断外部defer对象", function() {
	expect(1);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).then(function() {
		return tv.getDef(-1).then(tv.getFn(-1));
	}).then(-1).cancel();
	tv.teardown();
});
test("async cancel 超时调用cancel fail", function() {
	QUnit.expect(3);
	var tv = te.validate();
	tv.init();
	var def = tv.getDef(0).then(tv.getFn(1)).then(tv.getFn(2));
	setTimeout(def.cancel, 180);
	tv.teardown();
});
test("async then链测试", function() {
	QUnit.expect(3);
	var tv = te.validate();
	tv.init();
	tv.getDef(0, true).then(tv.getFn(-1), tv.getFn(1)).then(tv.getFn(-1),
			tv.getFn(2));
	tv.teardown();
});
test("async then 参数测试只有onSuccess", function() {
	QUnit.expect(3);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).then(tv.getFn(1)).then(tv.getFn(2));
	tv.teardown();
});
test("async then参数中async链情况 01", function() {
	QUnit.expect(4);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).then(function() {
		return tv.getDef(1).then(tv.getFn(2));
	}).then(tv.getFn(3));
	tv.teardown();
});
test("async success 方法", function() {
	QUnit.expect(2);
	var tv = te.validate();
	tv.init();
	tv.getDef(0).success(tv.getFn(1)).fail(tv.getFn(-1));
	tv.teardown();
});
test("async fail 方法", function() {
	QUnit.expect(3);
	var tv = te.validate();
	tv.init();
	tv.getDef(0,true).fail(tv.getFn(1)).fail(tv.getFn(2)).success(tv.getFn(-1));
	tv.teardown();
});