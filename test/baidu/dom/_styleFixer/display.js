module('baidu.dom._styleFixer');

test('display', function() {
	$(document.body).append('<div id="test_div"></div>');
	var div = $('div#test_div').css('height', '20px').css(
			'backgroundColor', 'red')[0];
	
	
	/**
	 * 三个分支分别处理IE、FF及其他
	 */
	if (ua.browser.ie && ua.browser.ie < 8) {
		var func = baidu.dom._styleFixer['display']['set'];
		ok(func && typeof func == 'function', 'check type');
		func(div, 'inline-block');
		equals(div.style.display, 'inline');
		equals(div.style.zoom, 1);

		func(div, 'block');
		equals(div.style.display, 'block');
	} else if (ua.browser.firefox && ua.browser.firefox < 3) {
		var func = baidu.dom._styleFixer['display']['set'];
		ok(func && typeof func == 'FUNCTION', 'check type');
		func(div, 'inline-block');
		equals(div.style.display, '-moz-inline-box');
	} else {
		var func = baidu.dom._styleFixer['display'];
		ok(func == null, 'not on ie6|7 ff2, display do not work!');
	}
	$(div).remove();
});
// 'display' : function() {
// var testitem = baidu.g("div_stylefixer");
// baidu.setStyle(testitem, "display", "inline-block");
// var value = baidu.getStyle(testitem, "display");
// if (baidu.ie && baidu.ie < 8)
// value_of(value).should_be("inline");
// else
// value_of(value).should_be("inline-block");
// },
