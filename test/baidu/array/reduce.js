module("baidu.array.reduce");

test("基础校验", function(){
	var arr = [1,2,3], ite = function(acc, i){return acc+i;};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 6, "校验返回结果");
});

test("特殊情况", function(){
	//空数组
	var arr = [], ite = function(acc, i){return acc+1;};
	equals(baidu.array.reduce(arr, ite, 0), 0, "空串转换应该返回初始值");
});
