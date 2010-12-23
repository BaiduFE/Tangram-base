module("baidu.page.getHeight");

test("高度检测", function() {
	ua.frameExt( {
		ontest : function(w, f) {
			var doc = w.document;
			var body = doc.body;
			body.style.margin = 0;
			var div = doc.createElement('div');
			body.appendChild(div);
			div.style.width = '2000px';
			div.style.height = '2000px';
			equals(w.baidu.page.getHeight(), 2000);
			this.finish();
		}
	});
});
