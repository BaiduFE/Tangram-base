module('baidu.dom.removeStyle')

/**
 * 删除属性，基本用例
 */
test('remove Style base testcases', function(){
	var div = document.createElement('div');
    div.style.width = '100px';
	ok(div.style.width=='100px', "property before remove");
    baidu.dom.removeStyle(div, "width");
	ok(!div.style.width, "property after remove");
})
