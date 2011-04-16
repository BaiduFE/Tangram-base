//removeAt测试
module("baidu.array.removeAt");

test("removeAt函数输入数组和合法的下标", function() {
	expect(4);
	var arraytest = [ 2, 4, 6, 9, 'name', 'job' ];
	var r = baidu.array.removeAt(arraytest, 2);
	equal(r, 6, "输入数组，删除数组元素6");
	var array = [ 2, 4, 9, 'name', 'job' ];
	ok(ua.isEqualArray(arraytest, array), "删除数组元素后");

	arraytest = [ 2, 4, 6, 9, 'name', 'job' ];
	r = baidu.array.removeAt(arraytest, 5);
	equal(r, 'job', "删除数组项job");
	array = [ 2, 4, 6, 9, 'name' ];
	ok(ua.isEqualArray(arraytest, array), "删除数组项后");
});

test("removeAt函数输入数组和下标的边界值", function() {
	expect(4);
	var arraytest = [ 4, 6, 8, 'one', 'two', 10, 11 ];
	var r = baidu.array.removeAt(arraytest, 0);
	equal(r, 4, "删除数组元素4");
	var array = [ 6, 8, 'one', 'two', 10, 11 ];
	ok(ua.isEqualArray(arraytest, array), "删除下边界下标的数组元素后");

	var r = baidu.array.removeAt(arraytest, 5);
	array = [ 6, 8, 'one', 'two', 10 ];
	equal(r, 11, "删除数组元素11");
	ok(ua.isEqualArray(arraytest, array), "删除上边界下标的数组后");
});

test("removeAt函数输入数组和下标-1", function() {
	expect(2);
	var arraytest = [ 4, 6, 8, 'one', 'two', 10, 11 ];
	var r = baidu.array.removeAt(arraytest, -1);
	var array = [ 4, 6, 8, 'one', 'two', 10 ];
	equal(r, 11, "删除数组元素11");
	ok(ua.isEqualArray(arraytest, array), "删除数组下标为-1");
});

test("removeAt函数输入数组和下标超过数组长度", function() {
	expect(2);
	var arraytest = [ 4, 6, 8, 'one', 'two', 10, 11 ];
	var r = baidu.array.removeAt(arraytest, 7);
	equal(r, undefined, "下标超过数组长度，找不到删除的元素");
	var array = [ 4, 6, 8, 'one', 'two', 10, 11 ];
	ok(ua.isEqualArray(arraytest, array), "下标超过数组长度");
});

test("removeAt函数输入数组和负数下标（超出数组长度）", function() {
	var arraytest = [ 4, 6, 8, 'one', 'two', 10, 11 ];
	var r = baidu.array.removeAt(arraytest, -100);
	equal(r, 4, "数组和负数下标（超出数组长度");
	var array = [ 6, 8, 'one', 'two', 10, 11 ];
	ok(ua.isEqualArray(arraytest, array), "负数下标下标超过数组长度");
});

test("removeAt函数输入空数组和合法的下标", function() {
	expect(2);
	var arraytest = [];
	var r = baidu.array.removeAt(arraytest, 0);
	equal(r, undefined, "空数组，找不到删除的元素");
	equal(arraytest.toString(), "", "空数组，无法删除找不到的元素");
});

test("removeAt函数输入空数组和下标的边界值", function() {
	expect(4);
	var arr = [];
	var r = baidu.array.removeAt(arr, -1);
	equal(r, undefined, "空数组，找不到负数下标对应的元素");
	equal(arr.toString(), "", "空数组，无法删除负数下标对应的元素");

	var arraytest = [];
	r = baidu.array.removeAt(arraytest, 2);
	equal(r, undefined, "空数组，找不到下标对应的元素");
	equal(arraytest.toString(), "", "空数组，无法删除下标对应的元素");
});
