module("baidu.array.map");

test("基础校验", function(){
	var arr = [1,2,3], ite = function(item, i){return item+i;};
	var new_arr = baidu.array.map(arr, ite);
	equals(new_arr.length, 3, "校验返回结果长度");
	for(var i = 0; i < 3; i++)
		equals(new_arr[i], ite(arr[i], i), "校验第"+i+"个返回值");
});
test("测试this指针",function(){

	var aArray = [1,2,3], thisObject = {a:'b'};
	baidu.array.map(aArray, function(iVal, iIndex){  equal(this.a, 'b', '传了this指针的情况')}, thisObject);

	var aArray = [1,2,3];
	baidu.array.map(aArray, function(iVal, iIndex){  equal(this[0], 1, '没传this指针的情况')});
});

test("特殊情况", function(){
	//空数组
	var arr = [], ite = function(){return 0;};
	equals(baidu.array.map(arr, ite).length, 0, "空串转换应该返回0");
});
