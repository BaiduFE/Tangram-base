module("baidu.array.reduce");
/**
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
 * Apply a function against an accumulator and each value of the array (from
 * left-to-right) as to reduce it to a single value.
 */

test("基础校验", function() {
	var arr = [ 1, 2, 3 ], ite = function(last, now, index, arr) {
		return last + now;
	};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 6, "校验返回结果");

	var arr = [ 1, 2, 3 ], ite = function(last, now, index, arr) {
		return last + index;
	};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 3, "校验返回结果");

	var arr = [ 1, 2, 3 ], ite = function(last, now, index, arr) {
		return last + arr[index];
	};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 6, "校验返回结果");

});

test("特殊情况", function() {
	// 空数组
	var arr = [], ite = function(acc, i) {
		return acc + 1;
	};
	equals(baidu.array.reduce(arr, ite, 0), 0, "空串转换应该返回初始值");
	equals(baidu.array.reduce([], function() {
	}), undefined, '空串空初始值返回undefined');
	// If no initialValue was provided, then previousValue will be equal to the
	// first value in the array and currentValue will be equal to the second.
	equals(baidu.array.reduce([ 1 ], function(a, b) {
		// 函数进不来
		ok(false, '只有一个参数');
		return a + b;
	}), 1, '校验返回结果 - 数组只有一项');
});

/**
 * [ 0, 1, 2, 3, 4 ] .reduce(function(previousValue, currentValue, index, array) {
 * return previousValue + currentValue; });
 * <li>// First call previousValue = 0, currentValue = 1, index = 1
 * <li>// Second call previousValue = 1, currentValue = 2, index = 2
 * <li>// Third call previousValue = 3, currentValue = 3, index = 3
 * <li>// Fourth call previousValue = 6, currentValue = 4, index = 4
 * <li>// array is always the object [0,1,2,3,4] upon which reduce was called //
 * Return Value: 10
 */
test('参数判断', function() {
	var step = 0;
	equals(baidu.array.reduce([ 0, 1, 2, 3, 4 ],
			function(last, now, index, arr) {
				equals(last, step, 'check last');
				equals(now, step + 1, 'check now');
				equals(index - 1, step++, 'check index');
				deepEqual(arr, [ 0, 1, 2, 3, 4 ], 'check arr');
				return now;
			}), 4, 'return value');
	step = 0;
	equals(baidu.array.reduce([ 0, 1, 2, 3, 4 ],
			function(last, now, index, arr) {
				equals(last, step - 1, 'check last');// 第一个last是-1
				equals(now, step, 'check now');
				equals(index, step++, 'check index');
				deepEqual(arr, [ 0, 1, 2, 3, 4 ], 'check arr');
				return now;
			}, -1), 4, 'return value with initializer');
});

/**
 * var flattened = [[0,1], [2,3], [4,5]].reduce(function(a,b) { return
 * a.concat(b); });
 * 
 */
test('混合数组，来自w3c示例', function() {
	var flatended = [ [ 0, 1 ], [ 2, 3 ], [ 4, 5 ] ];
	deepEqual(baidu.array.reduce(flatended, function(last, now) {
		return last.concat(now);
	}), [ 0, 1, 2, 3, 4, 5 ], 'check mix array');
});

test('excluding holes in the array', function() {
	equals(baidu.array.reduce([ 0, null, 1 ], function(a, b) {
		return a + b;
	}), 1, 'check holes');
	equals(baidu.array.reduce([ null, 0, 1 ], function(a, b) {
		return a + b;
	}), 1, 'check holes');
	equals(baidu.array.reduce([ 0, 1, null ], function(a, b) {
		return a + b;
	}), 1, 'check holes');
	equals(baidu.array.reduce([ 0, 1, null ], function(a, b) {
		return a + b;
	},1), 2, 'check holes');
});
