module("baidu.lang.addSingletonGetter");

test("addSingletonGetter", function(){
  expect(2);

  function MyClass() {};
  baidu.lang.addSingletonGetter(MyClass);
  
  ok(typeof MyClass.getInstance == 'function', 'getInstance method exists');
  ok(MyClass.getInstance() == MyClass.getInstance(), 'the same instance');
});





















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
