//lastIndexOf测试
module("baidu.array.lastIndexOf");

test("正常用例",function(){
	expect(3);
	var arraytest = [2,5,8,19,56,5]; //检测indexOf的正常输入
    r = baidu.array.lastIndexOf(arraytest,5);
    equal(r,5,"查询数组元素");
    r = baidu.array.lastIndexOf(arraytest,10);
    equal(r,-1,"查询不存在的数组元素");
    r = baidu.array.lastIndexOf(arraytest,5, -2);
    equal(r,1,"负数的情况");
});

test("特殊数组",function(){
	expect(3);
	var arraytest = [2,5,8,19,'name','44',56,5,'name']; //检测indexOf的正常输入
    var r = baidu.array.lastIndexOf(arraytest,'name');
    equal(r,8,"查询特殊数组项");
    arraytest = [2,5,8,19,'name','44',56,5,'name'];
    var i = 5;
    r = baidu.array.lastIndexOf(arraytest,i);
    equal(r,7,"查询数组项");
    r = baidu.array.lastIndexOf(arraytest,'help');
    equal(r,-1,"查询不存在的数组项");
});


test("异常用例",function(){
	expect(2);
	var r = baidu.array.lastIndexOf( [], 1);
    equal(r,-1,"空数组查询数组元素");
    var arraytest = new Array( );
    var fn = function (x) { return x>15;};
    r = baidu.array.lastIndexOf(arraytest,fn);
    equal(r,-1,"空数组查询函数");
});
