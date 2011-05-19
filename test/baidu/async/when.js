module("baidu.async.when");
(function() {
	window.tt = window.tt || {};
	tt.check = function(value) {
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
			 * @returns 返回一个Function对象
			 */
			getFn : function(expIdx) {
				return expIdx || expIdx === 0 ? function() {
					equals(_index++, expIdx, expIdx + 'st call');
				} : function() {
				};
			},
			/**
			 * @param expIdx 期望的Index
			 * @param isFail 是否调用OnFail链
			 * @returns 返回Deferred对象
			 */
			getDef : function(expIdx, isFail) {
				equals(_index++, expIdx, expIdx + 'st call');
				var def = new baidu.async.Deferred();
				setTimeout(isFail ? def.reject : def.resolve, 10);
				return def;
			},
			/**
			 * 对测试调用结束
			 * 
			 * @returns
			 */
			teardown : function(time) {
				delete _index;
				time && time != 0 ? time : 200;
				setTimeout(QUnit.start, 200);
			}
		};
	};
})();
//
test("when第一个参数async方法", function() {
	QUnit.expect(3);
	var te = tt.check();
	te.init();
	baidu.async.when(te.getDef(0), te.getFn(1)).then(te.getFn(2));
	te.teardown();
});
//
test("when第一个参数async方法,回调onFail", function() {
	QUnit.expect(3);
	var te = tt.check();
	te.init();
	baidu.async.when(te.getDef(0, true), te.getFn(-1), te.getFn(1)).then(
			te.getFn(-1), te.getFn(2));
	te.teardown();
});

test("when第一个参数sync方法", function() {
	QUnit.expect(3);
	var te = tt.check();
	te.init();
	baidu.async.when(te.getFn(0)(), te.getFn(1), te.getFn(-1)).then(te.getFn(2),
			te.getFn(-1));
	te.teardown();
});
//
test("when第一个参数是形参", function() {
	QUnit.expect(2);
	var te = tt.check();
	te.init();
	baidu.async.when('test', te.getFn(0), te.getFn(-1)).then(te.getFn(1),
			te.getFn(-1));
	te.teardown();
});
//
test("when中onSuccess是函数，then中调用defer", function() {
	QUnit.expect(5);
	var te = tt.check();
	te.init();
	baidu.async.when(te.getDef(0), te.getFn(1), te.getFn(-1)).then(function() {
		return	te.getDef(2).then(te.getFn(3));
	}).then(te.getFn(4));
	te.teardown();
});
test("when中onSuccess是Defer对象的情况", function() {
	QUnit.expect(5);
	var te = tt.check();
	te.init();
	baidu.async.when(te.getDef(0), function() {
		return te.getDef(1).then(te.getFn(2));
	}).then(te.getFn(3)).then(te.getFn(4));
	te.teardown();
});