/**
 * 测试点设计：
 * <li>函数被正确调用并返回结果正确
 * <li>正确的循环次数
 * <li>递归参数的校验
 * <li>多参数函数的处理
 */
module('baidu.fn.multize');

test('base', function() {
	var fn = baidu.fn.multize(function(a) {
		if (a instanceof Array)
			return a[0] + 1;
		return a + 1;
	});
	var ret = fn( [ 1, 2 ]);
	equals(ret.length, 2, 'length of return');
	equals(ret[0], 2, 'first return');
	equals(ret[1], 3, 'second return');
	var ret = fn( [ 1, [ 1 ] ]);
	equals(ret.length, 2, 'length of return');
	equals(ret[0], 2, 'first return');
	equals(ret[1], 2, 'second return');
});

test('recursive', function() {
	var fn = baidu.fn.multize(function(a) {
		return a + 1;
	}, true);
	var ret = fn( [ 1, 2, [ 3, 4 ] ]);
	equals(ret.length, 3, 'length of return');
	equals(ret[0], 2, '1');
	equals(ret[1], 3, '2');
	equals(ret[2][0], 4, '3-1');
	equals(ret[2][1], 5, '3-2');

	ret = fn( [ [ 1, 2 ] ]);
	equals(ret.length, 1, 'length of return');
	equals(ret[0][0], 2, '1-1');
	equals(ret[0][1], 3, '1-2');
});

test('multi params', function() {
	var fn = baidu.fn.multize(function(a, b) {
		return a + b;
	});
	var ret = fn( [ 1, 2 ], 3);
	equals(ret.length, 2, 'length of return');
	equals(ret[0], 4);
	equals(ret[1], 5);
});
