module('baidu.dom.getPosition quirk');
var fid = 0;
/**
 * testing for get position
 * 
 * @param left
 *            expected left of testing item
 * @param top
 *            expected top of testing item
 * @param run
 *            callback method before check, if return, use this item as testing
 *            item parent
 * @param abs
 *            use callback return as testing item
 * @return
 */
function go(/* Integer */left, /* Integer */top, /* Function */
run, /* Boolean */abs) {
	/* 提供调试模式，调试模式下添加的iframe不会删除 */
	var debug = true;
	ua.frameExt({
		ontest : function(w) {
			var p = run(w.document) || w.document.body;
			var div = abs ? p : p.appendChild(w.document.createElement('div'));
			var pos = w.baidu.dom.getPosition(div);
			w.$(div).css('width', 20).css('height', 20).css('backgroundColor',
					'#ABC');
			equals(pos.left, left, 'check left');
			equals(pos.top, top, 'check top');
			if (debug) {
				// 追加一个用于调试定位的div，该div位置为absolute
				var d1 = w.document.body.appendChild(w.document
						.createElement('div'));
				w.$(d1).css('position', 'absolute').css('left', 0)
						.css('top', 0).css('height', 10).css('width', 10).css(
								'backgroundColor', 'red');
			}
			this.finish();
		},
		id : debug ? fid++ : 'f'
	});
};

/**
 * <li>set body margin as 0
 * <li>set body border width as 0
 */
test('body border 0 and margin 0 and padding 0', function() {
	go(0, 0, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		doc.body.style.padding = '0px';
	});
});

/**
 * set body's margin
 */
test('body margin 10px', function() {
	var top = left = baidu.browser.isStrict ? 10 : 11;
	go(top, left, function(doc) {
		doc.body.style.margin = '10px';
		doc.body.style.borderWidth = '0px';
	});
});

/**
 * try scroll and check position
 */
test('scroll and fix', function() {
	var top = 30, left = 30;
	if (baidu.browser.ie || baidu.browser.maxthon) {
		// top = left = baidu.ie == 8 ? 0 : 1;
		top = left = 0;
	}
	go(left, top, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		doc.body.appendChild(div);
		div.style.width = '200%';
		div.style.height = '200%';
		var div1 = doc.createElement('div');
		div.appendChild(div1);
		div1.style.position = 'fixed';
		div1.style.left = '10px';
		div1.style.top = '10px';
		frames[frames.length - 1].scrollTo(20, 20);
		return div1;
	});
});

/**
 * set DIV with parent position as absolute
 * 
 */
test('parent border solid', function() {
	// var top = left = baidu.browser.ie && ((baidu.browser.ie==8&&
	// !baidu.browser.isStrict)||baidu.browser.ie<8) ? 14 : 13;
	var top = left = baidu.browser.ie ? 14 : 13;
	go(left, top, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		doc.body.appendChild(div);
		div.style.position = 'absolute';
		div.style.left = '10px';
		div.style.top = '10px';
		div.style.borderStyle = 'solid';
		div.style.margin = '0px';
		div.style.padding = '0px';
		return div;
	});
});

/**
 * set DIV's parent DIV postion as relative
 */
test('parent relative', function() {
	go(10, 10, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		doc.body.appendChild(div);
		div.style.position = 'relative';
		div.style.left = '10px';
		div.style.top = '10px';
		return div;
	});
});

/**
 * set DIV's parent padding
 */
test('parent padding', function() {
	go(10, 10, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		doc.body.appendChild(div);
		div.style.padding = '10px';
		div.style.borderWidth = '0px';
		div.style.margin = '0px';
		return div;
	});
});

/**
 * <li>set DIV's relative
 * <li>DIV has no parent
 */
test('self relative', function() {
	go(10, 10, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		doc.body.appendChild(div);
		div.style.position = 'relative';
		div.style.left = '10px';
		div.style.top = '10px';
		return div;
	}, 8, true);
});

/**
 * <li>set DIV's position as relative
 * <li>set DIV's parent DIV left and top as 10px
 */
test('parent absolute and self relative', function() {
	go(30, 30, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		var divp = doc.createElement('div');
		doc.body.appendChild(divp);
		divp.appendChild(div);
		divp.style.left = '20px';
		divp.style.top = '20px';
		divp.style.position = 'absolute';
		div.style.position = 'relative';
		div.style.left = '10px';
		div.style.top = '10px';
		// div.style.border = 'solid';
		return div;
	}, true);
});

/**
 * <li>set DIV's position as relative
 * <li>set DIV's parent DIV left and top as 10px
 */
test('many parent', function() {
	var sum = function(num, __sum) {
		return num <= 1 ? __sum : sum(num - 1, __sum + num);
	};
	var lay = 8;
	go(sum(lay, 0), sum(lay, 0), function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var cc = function(p, num) {
			var div = doc.createElement('div');
			div.style.border = 'solid';
			div.style.borderWidth = num + 'px';
			div.style.height = '80%';
			p.appendChild(div);
			if (num == 1)
				return div;
			else
				return cc(div, num - 1);
		};
		return cc(doc.body, lay);
	}, true);
});

/**
 * <li>set DIV's relative
 * <li>DIV has no parent
 */
test('self absolute', function() {
	go(0, 0, function(doc) {
		doc.body.style.margin = '0px';
		doc.body.style.borderWidth = '0px';
		var div = doc.createElement('div');
		doc.body.appendChild(div);
		div.style.position = 'absolute';
		div.style.left = '0px';
		div.style.top = '0px';
		return div;
	}, true);
});
