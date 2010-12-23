module('baidu.dom._styleFixer');

test('float', function() {
	equals(baidu.dom._styleFixer["float"], ua.browser.ie ? "styleFloat"
			: "cssFloat", 'check float');
});