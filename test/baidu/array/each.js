//each测试
module("baidu.array.each");

test("遍历array元素",function(){
	expect(2);
	var aArray = [1,2,3];
	baidu.array.each(aArray, function(iVal, iIndex){ aArray[iIndex]+=iIndex; });
	equal(aArray.toString(),"1,3,5","遍历array元素");
    baidu.each(aArray, function(iVal, iIndex){ aArray[iIndex]+=iIndex; });//快捷方式
	equal(aArray.toString(),"1,4,7","遍历array元素");
})

test("调用回调函数的测试",function(){
	expect(1);
	 var aArray = [1, 2, 3, 10, 4, 5];
     var fnHandle1 = function(iVal, iIndex) {
         if(iVal == 10) {
             return false;//后续的元素不再调用回调函数
         }
         aArray[iIndex]++;
//         alert(aArray);
     };
     baidu.array.each(aArray, fnHandle1);
     equal(aArray.toString(),"2,3,4,10,4,5","有条件地调用回调函数的测试");
})

test("第二个参数不是函数",function(){
	expect(1);
	var aArray = [1,2,3];
	var a =0;
	baidu.array.each(aArray,a);
	equal(aArray.toString(),"1,2,3","第二个参数不是函数");
})

test("数组有未定义的元素",function(){
	expect(1);
	var aArray = [1,,2,3];
	baidu.array.each(aArray, function(iVal, iIndex){ aArray[iIndex]+=iIndex; });
	equal(aArray.toString(),"1,NaN,4,6","数组中有元素没有显式设值");
	
})

test("第二个参数是空函数",function(){
	expect(1);
	var aArray = [1,2,3];
	baidu.array.each(aArray,function(){});
	equal(aArray.toString(),"1,2,3","empty function");
})

test("第一个参数不是数组",function(){
	expect(1);
	var iNumber = 10;
    equal(baidu.array.each(iNumber, function(){aArray[iIndex]+=iIndex;}),10,"对number调用each");
})
