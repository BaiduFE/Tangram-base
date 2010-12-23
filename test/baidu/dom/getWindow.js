module('baidu.dom.getWindow')

test('当前页元素weindow', function() {
	expect(5);
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.id = 'div_id';
	equal(baidu.dom.getWindow(div), window);
	equal(baidu.dom.getWindow(document), window);// document
	equal(baidu.dom.getWindow(document.body), window);// body
	equal(baidu.dom.getWindow(document.documentElement), window);
	equal(baidu.dom.getWindow('div_id'), window);

	document.body.removeChild(div);
});

test('iframe', function() {
	ua.frameExt(function(w){
		var gw = w.parent.baidu.dom.getWindow;
		w.$(w.document.body).append('<div id="test_div"></div>');
		equals(gw(w.$('div#test_div')[0]), w);
		equals(gw(w.document), w);
		equals(w.baidu.dom.getWindow(w.parent.document), w.parent);
		this.finish();
	});
});

// //baidu.dom.getWindow测试
// describe("baidu.dom.getWindow测试",{
// '获取当前页元素的window': function () {
// value_of(baidu.dom.getWindow(document.getElementById('selfWin'))).should_be(window);
// value_of(baidu.dom.getWindow('selfWin')).should_be(window);
// },
//
// '获取框架页元素的window': function () {
// var ifr = document.getElementById('winSubFrame');
// ifr.contentWindow.document.write('<html><head></head><body><div
// id="test"></div></body></html>');
// value_of(baidu.dom.getWindow(
// ifr.contentWindow.document.getElementById('test')))
// .should_be(ifr.contentWindow);
// }
// });
