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
