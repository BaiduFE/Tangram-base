module("baidu.page.loadCssFile");

test("load存在的Css", function() {
	var check = function(w, f) {
		var op, doc, body, div;
		op = this;
		doc = w.document;
		body = doc.body;
		div = doc.createElement('div');
		body.appendChild(div);
		div.id = 'css';
		w.baidu.page.loadCssFile(upath + 'css.css');
		if (w.$(div).css('display') == 'none') {
			ok(true, 'css load success');
			op.finish();
		} else {
			/**
			 * 超时1秒，IE下的加载在无缓存情况下会出现异步
			 */
			var count = 0, h = setInterval(function() {
				if (count++ == 50) {
					ok(false, 'timeout for load css in 1 sec!');
				} else if (w.$(div).css('display') == 'none') {
					ok(true, 'css load success');
				} else {
					return;
				}
				clearInterval(h);
				op.finish();
			}, 20);
		}
	};
	ua.frameExt(check);
});

/**
 * 这个用例只校验是否会抛异常
 */
test("load不存在的JS", function() {
	var check = function(w, f) {
		var op, doc, body, div;
		op = this;
		doc = w.document;
		body = doc.body;
		div = doc.createElement('div');
		body.appendChild(div);
		div.id = 'css';
		w.baidu.page.loadCssFile(upath + 'noexit.css');
		setTimeout(function() {
			op.finish();
		}, 200);
	};
	ua.frameExt(check);
});
