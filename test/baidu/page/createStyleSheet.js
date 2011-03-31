module("baidu.page.createStyleSheet");

test("create and add", function() {
	var check = function(w) {
		var op = this;
		var div = w.document.createElement('div');
		div.id = 'test1';
		div.style.width = 20;
		div.style.height = 20;
		div.style.backgroundColor = 'red';
		w.document.body.appendChild(div);
		
		var styleObj = w.baidu.page.createStyleSheet();
		styleObj.addRule("#test1", "display:none");
		equals(w.$(div).css('display'), 'none', 'check display');
		/* 这条会被覆盖所以不生效 */
		styleObj.addRule(".test1", "display:block", 0);
		equals(w.$(div).css('display'), 'none', 'check display');
		//暂时不修复ie浏览器原生的添加逗号分隔rule抛错的bug.
		//styleObj.addRule("#test1,#test2","color:#0000ff",2);
		//ok(w.$(div).css('color').match('255'), 'check color');
	
		/* 移除后生效 */
		styleObj.removeRule(1);
		equals(w.$(div).css('display'), 'block', 'check display');
		op.finish();
	};
	ua.frameExt(check);
});

test("remove rule", function() {
	var check = function(w) {
		var div = w.document.createElement("div");
		div.id = 'test2';
		div.className = 'test2';
		w.document.body.appendChild(div);
		var styleObj = w.baidu.page.createStyleSheet();
		styleObj.addRule("#test2", "display:none");
		equals(w.$(div).css('display'), 'none', 'check display');
		styleObj.removeRule(0);
		equals(w.$(div).css('display'), 'block', 'check display');
		this.finish();
	};
	ua.frameExt(check);
});

/**
 * 跨frame创建css并生效
 */
test('another document', function() {
	var check = function(w) {
		var op = this;
		var div = w.document.createElement('div');
		div.id = 'test3';
		div.style.width = 20;
		div.style.height = 20;
		div.style.backgroundColor = 'red';
		w.document.body.appendChild(div);
		var styleObj = baidu.page.createStyleSheet( {
			document : w.document
		});
		// debugger;
		styleObj.addRule("#test3", "display:none;");
		equals(div.style.display, '', 'check display by style.display');
		if (ua.browser.gecko > 0)/* firefox下，jquery 这个地方有个问题，取不到相应的值 */
			equals(w.getComputedStyle(div, null)['display'], 'none', 'check style');
		else
			equals($(div).css('display'), 'none', 'check display by $.css');
		op.finish();
	};
	ua.frameExt( {
		ontest : check,
		nojs : true
	});
});

test('url with add and remove', function() {
	var check = function(w) {
		var op = this;
		var div = w.document.createElement('div');
		div.id = 'css';
		div.style.width = 20;
		div.style.height = 20;
		div.style.backgroundColor = 'red';
		w.document.body.appendChild(div);
		var styleObj = w.baidu.page.createStyleSheet( {
			document : w.document,
			url : upath + 'css.css'
		});
		ok(ua.browser.ie ? styleObj != null : styleObj == null,
				'if not ie, return null with option url');
		var ho = 0, hi = setInterval(function() {
			if (w.$(div).css('display') == 'none') {
				ok(true, 'load css success');
			} else if (ho++ > 50) {
				ok(false, 'timeout wait for loading css in 500ms');
			} else {
				return;
			}
			clearInterval(hi);
			op.finish();
		}, 20);
	};
	ua.frameExt(check);
});
