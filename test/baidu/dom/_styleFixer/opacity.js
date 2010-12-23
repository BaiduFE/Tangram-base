module('baidu.dom._styleFixer.opacity');

test('opacity', function() {
	var func = baidu.dom._styleFixer.opacity;
	if (ua.browser.ie) {
		stop();
		$(document.body).append('<div style="left:20;top:20;" id="test_div"></div>');
		var div = $('div#test_div').css('height', 20).css('width', 20).css('position', 'absolute').css(
				'backgroundColor', 'red').css('filter', 'Alpha(opacity=50)')[0];
		func.set(div, 1);
		ok(func && func.get && func.set
				&& (typeof func.get).toLowerCase() == 'function'
				&& (typeof func.set).toLowerCase() == 'function', 'check opacity');
		equals(func.get(div), '1');
		func.set(div, 0.5);
		equals(func.get(div), '0.5');
		setTimeout(function() {
			$(div).remove();
			start();
		}, 200);
	} else {
		equals(func, null);
	}
});
