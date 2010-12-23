module('baidu.fn.bind');

/**
 * 对象作用域
 * <li>未绑定时作用域默认
 * <li>绑定并带默认参数
 * <li>参数后传入
 */
test('object', function() {
	var x = {
		a : 1,
		f : function(){}
	};

	var fn = function(b) {
		var me = this;
		return (me.a || 2) + b;
	};

	equals(fn(2), 4, '原始方法');	
	equals(baidu.fn.bind(fn, x, 2)(), 3, '参数前传');	
	equals(baidu.fn.bind(fn, x)(2), 3, '参数后传');
});

/**
 * 独立作用域，函数以自己为作用域
 */
test('function', function() {
	var x = {
		f : function(){
			equals(this, x.f, '独立作用域');
		}
	};
	baidu.fn.bind(x.f)();
});