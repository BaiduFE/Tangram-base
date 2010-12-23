module("baidu.page.getViewHeight");

test("无滚动条", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200).css('height', 200);
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
			equals(w.baidu.page.getViewHeight(), 200);
			op.finish();
		}
	});
});

test("有滚动条", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200).css('height',200 );
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
			w.$(w.document.body).append('<div id="test1"></div>');
			w.$('div#test1').css('width', 600).css('height', 600);
		    equals(w.baidu.page.getViewHeight(), ua.browser.ie == 8 ? 184 : 183);
			op.finish();
		}
	});
});
