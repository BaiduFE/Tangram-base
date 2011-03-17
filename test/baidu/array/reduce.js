module("baidu.array.reduce");

test("基础校验", function(){
	var arr = [1,2,3], ite = function(last, now, index, arr){return last+now;};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 6, "校验返回结果");

	var arr = [1,2,3], ite = function(last, now, index, arr){return last+index;};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 3, "校验返回结果");

	var arr = [1,2,3], ite = function(last, now, index, arr){return last+arr[index];};
	var sum = baidu.array.reduce(arr, ite, 0);
	equals(sum, 6, "校验返回结果");
});

test("特殊情况", function(){
	//空数组
	var arr = [], ite = function(acc, i){return acc+1;};
	equals(baidu.array.reduce(arr, ite, 0), 0, "空串转换应该返回初始值");
});
test("请QA补充下用例", function(){
	ok(false);
});
