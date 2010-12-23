//filter的测试
module("baidu.array.filter");

test("返回数组不为空",function(){
	{
		expect(1);
		var arraytest = [1,2,3,4,6,7,8,9,11];
	    var fn = function (x){ return x%2==0; };
	    var rArr = baidu.array.filter(arraytest, fn);
	    equal(rArr.toString(),"2,4,6,8","filter return value is not null");
	}
})

test("返回空数组",function(){
	{
		expect(1);
	    var arraytest = [1,2,3,4,6,7,8,9,11];
	    var fn = function (x){ return x%5==0; };
	    var rArr = baidu.array.filter(arraytest, fn);
	    equal(rArr.toString(),"","filter return value is null");
	}
})

test("第二个参数不是函数",function(){
	expect(1);
	var aArray = [1,2,3];
	var fn = "function";
	var rArr = baidu.array.filter(aArray,fn)
	equal(rArr.toString(),"","第二个参数不是函数");
})

test("第二个参数是空函数",function(){
	expect(1);
	var aArray = [1,2,3];
	var fn = {};
	var rArr = baidu.array.filter(aArray,fn)
	equal(rArr.toString(),"","第二个参数不是函数");
})

test("数组中有未定义的元素",function(){
	expect(1);
	var aArray = [1,2,3];
	var fn = function (x){ return x%2==0; };
	var fArray = baidu.array.filter(aArray,fn);
	equal(fArray,"2","数组中有未定义的元素");
	
})

test("第一个参数不是数组",function(){
	expect(1);
	var iNumber = 10;
	var fn = function(){aArray[iIndex]+=iIndex;};
	var fArray = baidu.array.filter(iNumber,fn);
    equal(fArray,"","对number调用filter");
})