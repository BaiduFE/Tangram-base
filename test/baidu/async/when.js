module("baidu.async.Deferred");

test("when第一个参数async方法", function() {
	testqueue = te.testqueue = [];
	stop();
	var when = baidu.async.when(te.async(), te.onSuccess1, te.onFail1).then(te.onSuccess2,
			te.onFail2);
	setTimeout(function() {
		QUnit.same(testqueue , [ "async", "onSuccess1", "onSuccess2" ], "call sequence");
		start();
	}, 100);
});
test("when第一个参数async方法,回调onFail", function() {
	testqueue = te.testqueue = [];
	stop();
	baidu.async.when(te.failAsync(), te.onSuccess1, te.onFail1).then(te.onSuccess2,
			te.onFail2);
	setTimeout(function() {
		QUnit.same(testqueue, [ "failAsnyc", "onFail1", "onFail2" ], "call sequence");
		start();
	}, 100);
});
test("when第一个参数sync方法", function() {
	testqueue = te.testqueue = [];
	stop();
	baidu.async.when(te.sync(), te.onSuccess1, te.onFail1).then(te.onSuccess2,
			te.onFail2);
	setTimeout(function() {
		QUnit.same(testqueue , [ "sync", "onSuccess1", "onSuccess2" ] ,"call sequence");
		start();
	}, 100);

});
test("when第一个参数是形参", function() {
	testqueue = te.testqueue = [];
	stop();
	baidu.async.when("onSuccess1",te.onSuccess1, te.onFail1).then(te.onSuccess2,
			te.onFail2);
	setTimeout(function() {
		QUnit.same(testqueue, ["onSuccess1", "onSuccess2" ],"call sequence");
		start();
	}, 100);
});
test("when中只有一个Success函数", function() {
	testqueue = te.testqueue = [];
	stop();
	baidu.async.when(te.sync(), te.onSuccess1).then(te.onSuccess2);
	setTimeout(function() {
		QUnit.same(testqueue , [ "sync", "onSuccess1", "onSuccess2" ],"call sequence");
		start();
	}, 100);
});
test("when中onSuccess是Defer对象的情况", function() {
	testqueue = te.testqueue = [];
	stop();
	baidu.async.when(te.sync(), te.antherAsync).then(te.onSuccess2);
	te.antherAsync().then(te.onSuccess3);
	setTimeout(function() {
		QUnit.same(testqueue, [ "sync", "antherAsync", "onSuccess3", "onSuccess2" ],"call sequence");
		start();
	}, 100);
});
(function() {
	te.onSuccess1 = function onSuccess1(value) {
		QUnit.equal("onSuccess1",value,"return value");
		te.testqueue.push("onSuccess1");
	};
	te.onFail1 = function onFail1(value) {
		QUnit.equal("onFail1" , value);
		te.testqueue.push("onFail1");
	};
	te.onSuccess2 = function onSuccess2(value) {
		te.testqueue.push("onSuccess2");
	};
	te.onSuccess3 = function onSuccess3(value) {
		te.testqueue.push("onSuccess3");
	};
	te.onFail2 = function onFail2(value) {
		te.testqueue.push("onFail2");
	};
	te.async = function async(value) {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			testqueue.push("async");
			defer.success("onSuccess1");
		}, 50);
		return defer;
	};
	te.antherAsync = function antherAsync(value) {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			testqueue.push("antherAsnyc");
//			defer.success("antherAsnyc");
		}, 50);
		return defer;
	};
	te.failAsync = function failAsync(value) {
		var defer = new baidu.async.Deferred();
		setTimeout(function() {
			testqueue.push("failAsnyc");
			defer.fail("onFail1");
		}, 50);
		return defer;
	};
	te.sync = function sync() {
		testqueue.push("sync");
		return "onSuccess1";
	};

})();