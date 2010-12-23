module("baidu.page.getScrollTop");

test("滚动条检测", function() {
	ua.frameExt( {
		ontest : function(w) {
			var op = this;
			equals(w.baidu.page.getScrollTop(), 0);
			op.finish();
		}
	});
});

test("有滚动", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('height', 200);
		},
		ontest : function(w) {
			var div = w.document.createElement('div');
			w.document.body.appendChild(div);
			w.$(div).css('height', 600);

			var op = this;
			equals(w.baidu.page.getScrollTop(), 0);
			op.finish();
		}
	});
});

test("滚动200", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('height', 200);
		},
		ontest : function(w) {
			var div = w.document.createElement('div');
			w.document.body.appendChild(div);
			w.$(div).css('height', 600);
			w.scrollTo(0, 200);
			var op = this;
			equals(w.baidu.page.getScrollTop(), 200);
			op.finish();
		}
	});
});
