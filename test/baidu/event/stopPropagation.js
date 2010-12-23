module("stopPropagation");
test("停止冒泡",function(){
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
	
	
	expect(2);
	var button = document.createElement('input');
	var div = document.createElement('div');
	var text = document.createElement('input');
	text.type = "text";
	button.type = "button";
	button.value = "stopProgagation";
	button.onclick = function(e){
		e = e || window.event;
		baidu.event.stopPropagation(e);
	};
	text.onclick = function(e){
		ok(true,"text clicked");
	};
	var propaFromSrcElem = function(e){
	       e = e || window.event;
	       var target = e.srcElement || e.target;
	       if(target.tagName == "INPUT"){
	    	   ok(true,"clicking text propagates to body");
	       }
	};
	on(document.body, "click", propaFromSrcElem);
	document.body.appendChild(div);
	div.appendChild(button);
	div.appendChild(text);
	
	UserAction.click(button,"click");//点击按钮，事件不会被冒泡到document.body
	UserAction.click(text,"click");//点击文本框，事件会被冒泡到document.body
	document.body.removeChild(div);
	un(document.body,"click",propaFromSrcElem);//unload掉body的click事件
});
