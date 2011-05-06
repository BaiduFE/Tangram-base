module("baidu.object.isEmpty");

test('isEmpty', function(){
  expect(7);

  ok(baidu.object.isEmpty({}));
  ok(baidu.object.isEmpty([]));
  ok(!baidu.object.isEmpty([10]));
  ok(!baidu.object.isEmpty({'a':10}));
  
  var array = [10];
  array.pop();
  ok(baidu.object.isEmpty(array));
  
  function MyClass(){};
  
  var myclass = new MyClass();
  myclass.b = 'b';
  delete myclass.b;
  ok(baidu.object.isEmpty(myclass));
  
  MyClass.prototype.a = 10;
  ok(!baidu.object.isEmpty(new MyClass()));
});





















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
