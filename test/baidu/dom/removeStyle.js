module('baidu.dom.removeStyle');

/**
 * 删除属性，基本用例
 */
test('remove Style base testcases', function(){
	//modify by bell，这个地方，在IE下固定会刷新整个浏览器而不是崩溃，诡异的问题
	var div = document.body.appendChild(document.createElement('div'));
    div.style.width = '100px';
	ok(div.style.width=='100px', "property before remove");
    baidu.dom.removeStyle(div, "width");
	ok(parseInt($(div).css('width')) != 100, "property after remove");
});
