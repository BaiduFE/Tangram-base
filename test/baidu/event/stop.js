//Event的stop方法
module("stop event");

test("stop事件--结合stopPropagation和preventDefault",function(){
	var on = function(element, type, fn) {
		if (element.addEventListener) {
			element.addEventListener(type, fn, false);
		} else if (document.body.attachEvent) {
			element.attachEvent('on' + type, fn);
		}
	};
	var un = function(element, type, fn) {
		if (element.removeEventListener) {
			element.removeEventListener(type, fn, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + type, fn);
		}
	};
	
	expect(1);
	var div = document.createElement('div');	
	document.body.appendChild(div);
	$(div).css('height', 3000);
	var a = document.createElement('a');
	a.setAttribute("href", "#");
	a.innerHTML = 'ToTop';
	a.target = '_self';
	a.onclick = function(e){//onclick事件中stopPropagation
		e = e || window.event;
		baidu.event.stopPropagation(e);
	};
	/*body中添加click事件的侦听，button的stopPropagation成功，则button的onclick事件不会冒泡到body*/
	var propaFromSrcElem = function(e){
	       e = e || window.event;
	       var target = e.srcElement || e.target;
	       if(target.tagName == "INPUT"){
	    	   ok(true,"clicking text propagates to body");
	       }
	};
	on(document.body, "click", propaFromSrcElem);
	document.body.appendChild(a);
	window.scroll(0, document.body.scrollHeight);
      /*获得鼠标点击事件*/
	ua.beforedispatch = function(e){
		e = e || window.event;
		baidu.event.preventDefault(e);	
	};
	ua.click(a, "click");
	var top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	ok(top != 0, "preventDefault");//a标签跳转到页首的功能被禁用
	un(document.body,"click",propaFromSrcElem);//恢复环境，去除事件
	document.body.removeChild(div);
	document.body.removeChild(a);
});

