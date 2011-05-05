module('baidu.fn.abstractMethod');

test("call abstractMethod", function(){
  expect(1);

  function MyClass() {}

  MyClass.prototype.method1 = baidu.fn.abstractMethod;

  var ins = new MyClass();
  try {
    ins.method1();
  } catch(e) {
    ok(true);
  }
});






















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
