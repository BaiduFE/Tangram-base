//测试baidu.array.unique
module("baidu.array.unique")

test("输入数组有重复元素",function(){
  expect(5);
  var arraytest = [2,3,6,2,4,2,3,'name',4,6,'word','name','2','3'];  //输入数组有重复元素
  var rArr = baidu.array.unique(arraytest);
  var array = [2,3,6,4,'name','word','2','3'];
  ok(UserAction.isEqualArray(rArr,array),"输入数组有重复项");
  var input = [1, 2, 1, 3];
  var output = baidu.array.unique(input);
  equal(output.toString(),"1,2,3","输入数组有重复元素")

  deepEqual(['abc', 'hasOwnProperty', 'toString'], baidu.array.unique(['abc', 'hasOwnProperty', 'toString', 'abc'])); 
  deepEqual([123], baidu.array.unique([Number(123), 123]));
  deepEqual(['123'], baidu.array.unique([String(123), String('123'), '123']));
})

test("输入数组沒有重复元素",function(){
  expect(1);
  var arraytest = [2,3,4,5,'name','2','3','5'];  //输入数组有重复元素
  var rArr = baidu.array.unique(arraytest);
  var array = [2,3,4,5,'name','2','3','5'];
  ok(UserAction.isEqualArray(rArr,array),"输入数组沒有重复项");
})

test("空数组",function(){
  expect(1);
  var array = baidu.array.unique([]);
  equal(array.toString(),"","空数组");
})

test("输入函数并输入iterator",function(){
  expect(2);
  var arraytest = ['name','job','ghost','window','linux','mail','we','word'];
  var fn = function (x,y){return x.length == y.length;};
  var  rArr = baidu.array.unique(arraytest, fn);
  var array = ['name','job','ghost','window','we'];
  ok(UserAction.isEqualArray(rArr,array),"输入函数并输入iterator");

  var input = ["one", "two", "three", "four"];
  var output = baidu.array.unique(input, function(x, y){
    return (x.length == y.length);
  });
  equal(output.toString(),"one,three,four","输入函数");
})
