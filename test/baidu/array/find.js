//baidu.array.find测试
module("baidu.array.find");

test("只有一个元素满足", function() {
	expect(1);
	var arraytest = [ 2, 3, 5, 6, 7, 'odd', 8, 9, 'even', 10 ]; // 检测只有一个元素使得iterator为true
	r = baidu.array.find(arraytest, function(x) {
		return x == 'odd';
	});
	equal(r, "odd", "只有一个元素满足条件");
});

test("回调函数中途返回", function() {
	expect(1);
	var arraytest = [ 2, 3, 5, 6, 7, 'odd', 8, 9, 'even', 10 ]; // 检测有多个元素满足使得iterator为true
	var fn = function(x) {
		if (typeof (x) == 'string')
			return false;
		return x % 3 == 0;
	};
	r = baidu.array.find(arraytest, fn);
	equal(r, 3, "回调函数中途返回");
});

test("返回结果为空", function() {
	expect(1);
	var arraytest = [ 2, 3, 5, 6, 7, 'odd', 8, 9, 'even', 10 ]; // 检测没有元素使得iterator为true
	var r = baidu.array.find(arraytest, function(x) {
		if (typeof (x) == 'string')
			return false;
		return x > 15;
	});
	equal(r, null, "find no result");
});
test("空数组", function() {
	expect(1);
	r = baidu.array.find([], function(x) {
		return x > 2;
	});
	equal(r, null, "empty array find nothing");
});

test("异常case", function() {
	expect(2);
	var r = baidu.array.find([ 1, 2, 3 ], "find function");
	equal(r, null, "not a function");
	var scope = 10;
	r = baidu.array.find([ 1, 2, 3 ], 100, scope);
	equal(r, null, "wrong parameters");
});
