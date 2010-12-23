module("baidu.event.EventArg");

test('preventDefault', function() {
	var op = {
		ontest : function(w) {
			var op = this;
			var doc = w.document;
			var div = doc.createElement('div');
			doc.body.appendChild(div);
			w.$(div).css('height', 2000);

			var a = doc.createElement('a');
			a.href = '#';
			a.innerHTML = 'ToTop_arg';
			a.target = '_self';
			doc.body.appendChild(a);
			w.scrollTo(0, doc.body.scrollHeight);

			UserAction.beforedispatch = function(e) {
				e = e || window.event;
				new baidu.event.EventArg(e).preventDefault();
			};

			w.$(a).click(
					function() {
						var top = w.pageYOffset
								|| doc.documentElement.scrollTop
								|| doc.body.scrollTop || 0;
						ok(top != 0, "preventDefault, not scroll to top");
						op.finish();
					});

			UserAction.click(a, "click");
		}
	};
	ua.frameExt(op);
});

/**
 * 这个用例在触发事件时，因为批量运行缘故，事件被挂到frame的上层窗口中……
 */
test('stopPropagation', function() {
	
	var test = function(w) {
		var op = this;
		var doc = w.document;
		var button = doc.body.appendChild(doc.createElement('button'));
		var div = doc.body.appendChild(doc.createElement('div'));
		w.$(doc.body).bind('click', function(e){
			ok(false, "event prevent propagation");
		});
		w.$(button).bind('click', function(e){
			ok(true);
			e = e || w.event;
			new baidu.event.EventArg(e, w).stopPropagation();
		})
		w.$(button).click();
		op.finish();
	};
	ua.frameExt(test);
});

test('stop', function() {
	var fe = ua.frameExt( {
		ontest : function(w) {
		var op = this;
			var doc = w.document;
			var div = doc.createElement('div');
			w.$(div).css('height', '2000px');
			doc.body.appendChild(div);
			var a = doc.createElement('a');
			a.setAttribute("href", "#");
			a.innerHTML = 'ToTop';
			a.target = '_self';
			a.onclick = function(e) {// onclick事件中stopPropagation
				e = e || window.event;
				new w.baidu.event.EventArg(e).stop();
			};
			doc.body.appendChild(a);
			/* body中添加click事件的侦听，button的stopPropagation成功，则button的onclick事件不会冒泡到body */
			var propaFromSrcElem = function(e) {
				e = e || w.event;
				var target = e.srcElement || e.target;
				if (target.tagName.toLowerCase() == "input") {
					ok(true, "clicking text propagates to body");
				}
			};
			w.$(doc.body).bind("click", propaFromSrcElem);
			w.scroll(0, doc.body.scrollHeight);
			/* 获得鼠标点击事件 */
			UserAction.beforedispatch = function(e) {
				e = e || w.event;
				new w.baidu.event.EventArg(e).stop();
			};
			UserAction.click(a);
			var top = w.pageYOffset || doc.documentElement.scrollTop
					|| doc.body.scrollTop || 0;
			ok(top != 0, "stop terminate click on a, current scroll top : "
					+ top);// a标签跳转到页首的功能被禁用			
			op.finish();
		}
	});
});

// test("preventDefault", function() {
// expect(1);
// var div = document.createElement('div');
// var img = document.createElement('img');
// // img.src = 'test.jpg';
// img.style.height = "2000px";
// div.appendChild(img);
// document.body.appendChild(div);
// var a = document.createElement('a');
// a.setAttribute("href", "#");
// a.innerHTML = 'ToTop_arg';
// a.target = '_self';
// document.body.appendChild(a);
// window.scrollTo(0, document.body.scrollHeight);
//
// UserAction.beforedispatch = function(e) {
// e = e || window.event;
// var arg_e = new baidu.event.EventArg(e);
// arg_e.preventDefault();
// };
// $(a).click(function(){
// var top = window.pageYOffset || document.documentElement.scrollTop
// || document.body.scrollTop || 0;
// ok(top != 0, "preventDefault, not scroll to top");
// $(a).unbind('click');
// document.body.removeChild(div);
// document.body.removeChild(a);
// start();
// });
// UserAction.click(a, "click");
// });
//
// test("arg stopPropagation", function() {
// expect(2);
// var button = document.createElement('input');
// var div = document.createElement('div');
// var text = document.createElement('input');
// text.type = "text";
// button.type = "button";
// button.value = "stopProgagation";
// button.onclick = function(e) {
// e = e || window.event;
// var arg_e = new baidu.event.EventArg(e);
// arg_e.stopPropagation(e);
// };
// text.onclick = function(e) {
// ok(true, "text clicked");
// };
// var propaFromSrcElem = function(e) {
// e = e || window.event;
// var target = e.srcElement || e.target;
// if (target.tagName == "INPUT") {
// ok(true, "clicking text propagates to body");
// }
// };
// $(document.body).click(propaFromSrcElem);
// document.body.appendChild(div);
// div.appendChild(button);
// div.appendChild(text);
//
// UserAction.click(button, "click");
// UserAction.click(text, "click");
// document.body.removeChild(div);
// $(document.body).unbind('click', propaFromSrcElem);
// });
//
// test("stop", function() {
// expect(1);
// var div = document.createElement('div');
// var img = document.createElement('img');
// // img.src = 'test.jpg';
// img.style.height = "2000px";
// div.appendChild(img);
// document.body.appendChild(div);
// var a = document.createElement('a');
// a.setAttribute("href", "#");
// a.innerHTML = 'ToTop';
// a.target = '_self';
// a.onclick = function(e) {// onclick事件中stopPropagation
// e = e || window.event;
// var arg_e = new baidu.event.EventArg(e);
// arg_e.stop(e);
// };
// /* body中添加click事件的侦听，button的stopPropagation成功，则button的onclick事件不会冒泡到body */
// var propaFromSrcElem = function(e) {
// e = e || window.event;
// var target = e.srcElement || e.target;
// if (target.tagName.toLowerCase() == "INPUT") {
// ok(true, "clicking text propagates to body");
// }
// };
// $(document.body).bind("click", propaFromSrcElem);
// document.body.appendChild(a);
// window.scroll(0, document.body.scrollHeight);
// /* 获得鼠标点击事件 */
// UserAction.beforedispatch = function(e) {
// e = e || window.event;
// var arg_e = new baidu.event.EventArg(e);
// arg_e.preventDefault(e);
// };
// UserAction.click(a, "click");
// var top = window.pageYOffset || document.documentElement.scrollTop
// || document.body.scrollTop || 0;
// ok(top != 0, "preventDefault");// a标签跳转到页首的功能被禁用
// $(document.body).unbind("click", propaFromSrcElem);// 恢复环境，去除事件
// document.body.removeChild(div);
// document.body.removeChild(a);
// start();
// });
