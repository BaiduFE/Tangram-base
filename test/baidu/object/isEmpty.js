module("baidu.object.isEmpty");

test('isEmpty', function(){
  expect(5);

  ok(baidu.object.isEmpty({}));
  ok(baidu.object.isEmpty([]));
  ok(!baidu.object.isEmpty([10]));
  ok(!baidu.object.isEmpty({'a':10}));

  function MyClass(){};
  MyClass.prototype.a = 10;

  ok(!baidu.object.isEmpty(new MyClass()));
});





















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
