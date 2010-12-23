//each测试
module("baidu.array.hash");

(function() {

	var check = function(ka, va) {
		var o = baidu.array.hash(ka, va);
		for ( var index = 0; index < ka.length; index++) {
			var key = ka[index], value = o[key];
			ok(o.hasOwnProperty(key), 'key in object property list : ' + key);
			equals(value, index >= va.length ? true : va[index], 'value check');
		}
	};

	test("number", function() {
		expect(16);
		check( [ 1, 2, 3 ], [ 4, 5, 6 ]);
		check( [ 1, 0 ], [ 0, 1 ]);
		check( [ 1, 3, 2 ], [ 0, 1 ]);
	});

	/**
	 * <li>常规字符串key和value校验
	 * <li>空串做key情况
	 */
	test('string', function() {
		expect(6);
		check( [ 'a', 'bb' ], [ 'a', 'b' ]);
		check([' '], [' ']);
	});

	test('mix', function() {
		expect(6);
		var ka = [ 10, 'bb', {} ], va = [ 9, 'b', {} ];
		check(ka, va);
	});
})();
