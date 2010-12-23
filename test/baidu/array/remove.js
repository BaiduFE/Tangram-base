//remove的测试
module("baidu.array.remove")

test("正常用例",function(){
	expect(5);
	var arraytest = [1,2,3,4,5];
    var arrayitem = 1;
    baidu.array.remove(arraytest,arrayitem);
    equal(arraytest.toString(),"2,3,4,5","去除单一数据类型元素");
    
    arraytest = ['a','sec','thir','good'];
    baidu.array.remove(arraytest,'sec');
    equal(arraytest.toString(),"a,thir,good");
    
    var arraytest = [1,'1',2,'2',35,'35',40];
    baidu.array.remove(arraytest,'35');
    var array = [1,'1',2,'2',35,40];
    ok(UserAction.isEqualArray(arraytest,array),"array中多种数据类型，去除同名字符串");
    
    array = arraytest = [1,'1',2,'2',35,'35',40];
    baidu.array.remove(arraytest,35);
    array = [1,'1',2,'2','35',40];
    ok(UserAction.isEqualArray(arraytest,array),"array中多种数据结构，去除同名整数");
    baidu.array.remove(arraytest,60);
    array = [1,'1',2,'2','35',40];
    ok(UserAction.isEqualArray(arraytest,array),"要删除的元素不存在");
})

test("多个元素符合条件",function(){
	expect(1);
	var arraytest = [1,'1',2,'2',2,'35',1,40,2,'2'];
    var arrayitem = 2;
    var array = [1,'1','2','35',1,40,'2'];
    baidu.array.remove(arraytest,arrayitem);
    ok(UserAction.isEqualArray(arraytest,array),"多个元素符合条件");
})

test("参数为函数",function(){
	expect(2);
	    var arraytest=[1,2,3,4,25];
        var iter = function (x){return x%2!=0;};
        baidu.array.remove(arraytest,iter);
        var array = [2,4];
        ok(UserAction.isEqualArray(array,arraytest),"参数为函数，单一类型数组");
        
        arraytest = [1,2,3,4,25];
      var iter = function (x){y=Number(x);return y%2!=0;};
      array = ['2',4];
      baidu.array.remove(arraytest,iter);
      ok(UserAction.isEqualArray(array,arraytest),"参数为函数，多种类型数组");
})

test("没有元素使得iterator为真",function(){
	expect(1);
	    var arraytest =[1,2,3,4,25];
        baidu.array.remove(arraytest,function (x){return x==15;});
        var array = [1,2,3,4,25];
        ok(UserAction.isEqualArray(array,arraytest),"没有元素使得iterator为真");
})

test("iterator恒为真或恒假",function(){
	expect(2);
	    var arraytest =[1,2,3,4,'test'];
        baidu.array.remove(arraytest,function (x){return true;});
        var array = [];
        ok(UserAction.isEqualArray(array,arraytest),"iterator恒为真");
        arraytest =[1,2,3,4,'test'];
        baidu.array.remove(arraytest,function (x){return false;});
        var array = [1,2,3,4,'test'];
        ok(UserAction.isEqualArray(array,arraytest),"iterator恒为假");
})

test("空数组",function(){
	expect(3);
	var array = [];
	baidu.array.remove(array,2);
	equal(array.toString(),"","空数组删除元素");
	baidu.array.remove(array,function(x){return false});
	equal(array.toString(),"","空数组删除元素,iterator恒假");
	baidu.array.remove(array,function(x){return true});
	equal(array.toString(),"","空数组删除元素,iterator恒真");
})
