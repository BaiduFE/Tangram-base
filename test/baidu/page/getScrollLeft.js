module("baidu.page.getScrollLeft");

test("滚动条检测", function() {
	ua.frameExt( {
		ontest : function(w) {
			var op = this;
			equals(w.baidu.page.getScrollLeft(), 0);
			op.finish();
		}
	});
});

test("有滚动", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200);
		},
		ontest : function(w) {
			var div = w.document.createElement('div');
			w.document.body.appendChild(div);
			w.$(div).css('width', 600);

			var op = this;
			equals(w.baidu.page.getScrollLeft(), 0);
			op.finish();
		}
	});
});

/**
 * firefox下，必须设置frame的display block才能保证iframe不自适应宽度和高度
 * 
 */
test("滚动200", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200).css('height', 100).css('display', 'block');
		},
		ontest : function(w) {
			var div = w.document.createElement('div');
			w.document.body.appendChild(div);
			w.$(div).css('width', 600).css('height', 20);
			w.scrollTo(200, 0);
			var op = this;
			equals(w.baidu.page.getScrollLeft(), 200);
			op.finish();
		}
	});
});
