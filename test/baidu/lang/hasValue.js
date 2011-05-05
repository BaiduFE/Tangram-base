module("baidu.lang.hasValue");

test("hasValue", function(){
  expect(6);

  ok(!baidu.lang.hasValue(null));
  ok(!baidu.lang.hasValue(void 0));
  ok(!baidu.lang.hasValue());
  ok(baidu.lang.hasValue(0));
  ok(baidu.lang.hasValue(NaN));
  ok(baidu.lang.hasValue(''));
});




















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
