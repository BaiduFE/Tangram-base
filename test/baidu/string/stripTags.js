module('baidu.string.stripTags');

test('stripTags', function(){
  equals(baidu.string.stripTags('abc'),'abc');
  equals(baidu.string.stripTags('abc<ab>'), 'abc');
  equals(baidu.string.stripTags('<ab/>abc<ab>'), 'abc');
  equals(baidu.string.stripTags('<ab/>abc<ab><ab><ab><ab>'), 'abc');
  equals(baidu.string.stripTags('<AB/>abc<ab><AB><ab><AB>'), 'abc');
  equals(baidu.string.stripTags('<AB/>abc<><AB>123<ab><AB>'), 'abc<>123');
  equals(baidu.string.stripTags('<ab/>abc<ab/>'), 'abc');
  equals(baidu.string.stripTags('<ab/><ab/>'), '');
});





















/* vim: set ts=4 sw=4 sts=4 tw=100 noet: */
