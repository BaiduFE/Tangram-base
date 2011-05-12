module('baidu.dom.drag');

//test('drag with update', function() {
//	stop();
//	expect(2);
//	var div = document.createElement('div');
//	document.body.appendChild(div);
//	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
//			'height', '100px').css('width', '100px').css('backgroundColor','red');
//	ua.mousemove(document, {
//		clientX : 0,
//		clientY : 0
//	});
//	var d = baidu.dom.drag(div, {
//		ondragend : function(ele, op) {
//			setTimeout(function() {
//				equal(parseInt($(ele).css('left')), 100, 'stop left');
//				equal(parseInt($(ele).css('top')), 50, 'stop top');
//				document.body.removeChild(div);
//				start();
//			}, 1);
//		}
//	});
//	var options = {
//			ondragend : function(ele, op) {
//			    setTimeout(function() {
//					equal(parseInt($(ele).css('left')), 150, 'stop left');
//					equal(parseInt($(ele).css('top')), 100, 'stop top');
//					document.body.removeChild(div);
//					start();
//			    }, 1);
//		    }
//		};
//	d.update(options);
//	setTimeout(function() {
//		ua.mousemove(document, {
//			clientX : 150,
//			clientY : 100
//		});
//	}, 50);
//	setTimeout(function() {
//		ua.mouseup(document);
//	}, 100);
//});
//
//test('drag', function() {
//	stop();
////	if (ua.browser.opera) {
////		expect(4);
////	} else
//		expect(2);
//	var div = document.createElement('div');
//	document.body.appendChild(div);
//	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
//			'height', '100px').css('width', '100px').css('backgroundColor',
//			'red');
//	ua.mousemove(document, {
//		clientX : 0,
//		clientY : 0
//	});
//	var d = baidu.dom.drag(div, {
//		ondrag : function(ele, op) {
//			// ok(true,'div is dragged');
//		},
//		ondragend : function(ele, op) {
//			setTimeout(function() {
//				equal(parseInt($(ele).css('left')), 100, 'stop left');
//				equal(parseInt($(ele).css('top')), 50, 'stop top');
//				document.body.removeChild(div);
//				start();
//			}, 1);
//		}
//	});
//	
//	setTimeout(function() {
//		ua.mousemove(document, {
//			clientX : 100,
//			clientY : 50
//		});
//
//	}, 50);
//	setTimeout(function() {
//		ua.mouseup(document);
//	}, 100);
//});
//
//test('drag within range from outside to edge', function() {
//	stop();
//	expect(4);
//	var div = document.createElement('div');
//	document.body.appendChild(div);
//	ua.mousemove(document, {
//		clientX : 0,
//		clientY : 0
//	});
//	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
//			'height', '100px').css('width', '100px').css('backgroundColor',
//			'red');
//	baidu.dom.drag(div, {
//		ondragstart : function(ele, op) {
//			equal(parseInt($(ele).css('left')), 0, 'start left');
//			equal(parseInt($(ele).css('top')), 0, 'start top');
//		},
//		ondragend : function(ele, op) {
//			setTimeout(function() {
//				equal(parseInt($(ele).css('left')), 30, 'stop left');
//				equal(parseInt($(ele).css('top')), 30, 'stop top');
//				document.body.removeChild(div);
//				start();
//			}, 1);
//		},
//		range : [ 20, 130, 130, 30 ]//上右下左
//	});
//	// move(div, 0, 0);
//	setTimeout(function() {
//		ua.mousemove(document, {
//			clientX : 50,
//			clientY : 50
//		});
//	}, 50);
//	setTimeout(function() {
//		ua.mouseup(div);
//	}, 100);
//});
//
//test('drag within range from inside to edge', function() {
//	stop();
//	expect(4);
//	var div = document.createElement('div');
//	document.body.appendChild(div);
//	ua.mousemove(document, {
//		clientX : 0,
//		clientY : 0
//	});
//	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
//			'height', '50px').css('width', '50px').css('backgroundColor',
//			'red');
//	baidu.dom.drag(div, {
//		ondragstart : function(ele, op) {
//			equal(parseInt($(ele).css('left')), 0, 'start left');
//			equal(parseInt($(ele).css('top')), 0, 'start top');
//		},
//		ondragend : function(ele, op) {
//			setTimeout(function() {
//				equal(parseInt($(ele).css('left')), 80, 'stop left');
//				equal(parseInt($(ele).css('top')), 80, 'stop top');
//				document.body.removeChild(div);
//				start();
//			}, 1);
//		},
//		range : [ 0, 130, 130, 0 ]//上右下左
//	});
//	setTimeout(function() {
//		ua.mousemove(document, {
//			clientX : 80,
//			clientY : 80
//		});
//	}, 50);
//	setTimeout(function() {
//		ua.mouseup(div);
//	}, 100);
//});
//
//test('drag within range from inside to outside', function() {
//	stop();
//	expect(4);
//	var div = document.createElement('div');
//	document.body.appendChild(div);
//	ua.mousemove(document, {
//		clientX : 0,
//		clientY : 0
//	});
//	$(div).css('position', 'absolute').css('left', '0').css('top', '0').css(
//			'height', '50px').css('width', '50px').css('backgroundColor',
//			'red');
//	baidu.dom.drag(div, {
//		ondragstart : function(ele, op) {
//			equal(parseInt($(ele).css('left')), 0, 'start left');
//			equal(parseInt($(ele).css('top')), 0, 'start top');
//		},
//		ondragend : function(ele, op) {
//			setTimeout(function() {
//				equal(parseInt($(ele).css('left')), 80, 'stop left');
//				equal(parseInt($(ele).css('top')), 80, 'stop top');
//				document.body.removeChild(div);
//				start();
//			}, 1);
//		},
//		range : [ 0, 130, 130, 0 ]//上右下左
//	});
//	setTimeout(function() {
//		ua.mousemove(document, {
//			clientX : 150,
//			clientY : 150
//		});
//	}, 50);
//	setTimeout(function() {
//		ua.mouseup(div);
//	}, 100);
//});
