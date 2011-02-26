module("baidu.lang.Event");
(function() {
	/* 引入_inherits */
	var _inherits = function(subClass, superClass, className) {
		var key, proto, selfProps = subClass.prototype, clazz = new Function();

		clazz.prototype = superClass.prototype;
		proto = subClass.prototype = new clazz();
		for (key in selfProps) {
			proto[key] = selfProps[key];
		}
		subClass.prototype.constructor = subClass;
		subClass.superClass = superClass.prototype;

		// 类名标识，兼容Class的toString，基本没用
		if ("string" == typeof className) {
			proto._className = className;
		}
	};
	test("dispatchEvent", function() {
		expect(2);
		function myClass() {
			this.name = "myclass";
		}

		_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
			var obj = new myClass();
			obj.onMyEvent = function() {
				ok(true, "myEvent is dispatched");
			};

			var myEventWithoutOn = new (baidu.lang.Event)("MyEvent", obj);// 自定义事件对象,不以on开头
			var myEventWithOn = new (baidu.lang.Event)("onMyEvent")
			obj.dispatchEvent(myEventWithoutOn);
			obj.dispatchEvent(myEventWithOn);
		
		});
	
	
	test("addEventListener", function() {
		function myClass() {
			this.name = "myclass";
		}

		_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
			var obj = new myClass();
			function listner(){ok(true, "listner is added");}
			
			var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent", obj);
			obj.addEventListener("onMyEvent",listner,'onMyEvent');
			obj.dispatchEvent("onMyEvent");

		});
	
	test("removeEventListener", function() {
		function myClass() {
			this.name = "myclass";
		}

		_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
		   expect(2);
			var obj = new myClass();
			function listner(){ok(true, "listner is added");}
			
			var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent", obj);
			obj.addEventListener("onMyEvent",listner,'pointMyEvent');
			obj.dispatchEvent(myEventWithoutOn);
			obj.removeEventListener("onMyEvent",'pointMyEvent');
			obj.dispatchEvent(myEventWithoutOn);
			ok(true,"listner is removed");

		});

    test("removeEventListener - no handler", function () {  // 2011-2-26, 无handler参数时移除所有事件
		function myClass() {
			this.name = "myclass";
		}

		_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
		   expect(3);
			var obj = new myClass();
			function listner1(){ok(true, "listner1 is added");}
			function listner2(){ok(true, "listner2 is added");}

			var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent", obj);
			obj.addEventListener("onMyEvent",listner1);
			obj.addEventListener("onMyEvent",listner2);
			obj.dispatchEvent(myEventWithoutOn);
			obj.removeEventListener("onMyEvent");
			obj.dispatchEvent(myEventWithoutOn);
			ok(true,"listner is removed");
           
    });

})();

/*
 * The following defines several event handlers and their tags
 */
// Htag1 = 0;
// Htag2 = 0;
// Htag3 = 0;
// Htag4 = 0;
// Htag5 = 0;
// Htag6 = 0;
// Htag7 = 0;
// Htag8 = 0;
// Htag9 = 0;
// Htag10 = 0;
// Htag11 = 0;
// Htag12 = 0;
// eventType = '';
// eventTarget = null;
//
// resetTag = function() {
// Htag1 = 0;
// Htag2 = 0;
// Htag3 = 0;
// Htag4 = 0;
// Htag5 = 0;
// Htag6 = 0;
// Htag7 = 0;
// Htag8 = 0;
// Htag9 = 0;
// Htag10 = 0;
// Htag11 = 0;
// Htag12 = 0;
// eventType = '';
// eventTarget = null;
// };
//
// var handler1 = function(e) {
// Htag1 = Htag1 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
//
// // alert('handler1 '+'target:'+eventTarget.id);
// };
//
// var handler2 = function(e) {
// Htag2 = Htag2 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// // alert('handler2 '+'target:'+eventTarget.id);
// };
//
// var handler3 = function(e) {
// Htag3 = Htag3 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// // alert('handler3 '+'target:'+eventTarget.id);
// };
//
// var handler4 = function(e) {
// Htag4 = Htag4 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler5 = function(e) {
// Htag5 = Htag5 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler6 = function(e) {
// Htag6 = Htag6 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler7 = function(e) {
// Htag7 = Htag7 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler8 = function(e) {
// Htag8 = Htag8 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler9 = function(e) {
// Htag9 = Htag9 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler10 = function(e) {
// Htag10 = Htag10 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
//
// var handler11 = function(e) {
// Htag11 = Htag11 + 1;
// oeve = e || window.event;
// eventType = oeve.type;
// eventTarget = oeve.target;
// };
// /*
// * var handler12 = function(e){ Htag12 = Htag12+1; oeve = e||window.event;
// * eventType = oeve.type; eventTarget = oeve.target; };
// */
// /*
// * The following part is about adding event listener and removing event
// listener
// */
// var myDom = function(domid) {
// this.domElement = document.getElementById(domid);
// baidu.lang.Class.call(this);
// this.dispose = function() {
// this.domElement = null;
// baidu.lang.Class.prototype.dispose();
// };
// };
// baidu.lang.inherits(myDom, baidu.lang.Class, 'myDom_class');
//
// /*
// * The following codes check the results with JSSpec framework
// */
// describe('test baidu.lang.Class.addEventListener', {
// 'given event type and handler function name' : function() {
// resetTag();
// Otest = new myDom('dom1');
// // alert(Otest.domElement.id);
//
// Otest.addEventListener('onTestEvent1', handler1);
// Otest.addEventListener('TestEvent1', handler2);
// Otest.addEventListener('TestEvent1', handler3);
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
// }
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // Mock click event
// uiut.MockEvents.click(document.getElementById('dom1'));
//
// value_of(eventTarget.id).should_be('dom1');
// value_of(eventType).should_be('onTestEvent1');
// value_of(Htag1).should_be(1);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
// value_of(Otest.toString()).should_be('[object myDom_class]');
//
// // Reset tags and release Object
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// },
// 'given event type and anonymous handler function' : function() {
// resetTag();
// Otest = new myDom('dom2');
// Otest.addEventListener('onmyEvent', function(e) {
// Htag4 = Htag4 + 1;
// eo = e || window.event;
// eventTarget = eo.target;
// eventType = eo.type;
// });
// Otest.addEventListener('onmyEvent', function(e) {
// Htag5 = Htag5 + 1;
// });
// Otest.addEventListener('myEvent', function(e) {
// Htag6 = Htag6 + 1;
// });
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onmyEvent'));
// }
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
// // Mock click event
// uiut.MockEvents.click(Otest.domElement);
//
// value_of(eventTarget.guid).should_be(Otest.guid);
// value_of(eventType).should_be('onmyEvent');
// value_of(Htag4).should_be(1);
// value_of(Htag5).should_be(1);
// value_of(Htag6).should_be(1);
//
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// },
// 'given event type and handler function name and key' : function() {
// resetTag();
// Otest = new myDom('dom1');
// Otest.addEventListener('onTestEvent2', handler1, 'key_H1');
// Otest.addEventListener('onTestEvent2', handler2, 'key_H2');
// Otest.addEventListener('onTestEvent2', handler3, 'key_H3');
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent2'));
// }
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
// // Mock click event
// uiut.MockEvents.click(document.getElementById('dom1'));
//
// value_of(eventTarget.guid).should_be(Otest.guid);
// value_of(eventType).should_be('onTestEvent2');
// value_of(Htag1).should_be(1);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
//
// // Reset tags and release Object
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// },
// 'given event type, anonymous handler function and key' : function() {
// resetTag();
// Otest = new myDom('dom2');
// Otest.addEventListener('onmyEvent', function(e) {
// Htag4 = Htag4 + 1;
// eo = e || window.event;
// eventTarget = eo.target;
// eventType = eo.type;
// }, 'Holy');
// Otest.addEventListener('onmyEvent', function(e) {
// Htag5 = Htag5 + 1;
// }, 'my');
// Otest.addEventListener('onmyEvent', function(e) {
// Htag6 = Htag6 + 1;
// }, 'God');
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onmyEvent',
// Otest.domElement));
// }
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
// // Mock click event
// uiut.MockEvents.click(Otest.domElement);
//
// value_of(eventTarget.id).should_be('dom2');
// value_of(eventType).should_be('onmyEvent');
// value_of(Htag4).should_be(1);
// value_of(Htag5).should_be(1);
// value_of(Htag6).should_be(1);
//
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// }
// });
//
// describe(
// 'baidu.lang.Class.removeEventListener test',
// {
// 'remove the handlers which are already bound to some event' : function() {
// resetTag();
// Otest = new myDom('dom3');
// Otest.addEventListener('onTestEvent1', handler1);
// Otest.addEventListener('TestEvent1', handler2);
// Otest.addEventListener('TestEvent1', handler3);
// Otest.addEventListener('onTestEvent2', handler4);
// Otest.addEventListener('onmyEvent', handler5);
// Otest.addEventListener('onWontHappen', handler6);
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
// }
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // remove handler
// Otest.removeEventListener('TestEvent1', handler1);
// Otest.removeEventListener('onTestEvent1', handler2)
//
// // Mock click event
// uiut.MockEvents.click(document.getElementById('dom3'));
//
// value_of(eventTarget.id).should_be('dom3');
// value_of(eventType).should_be('onTestEvent1');
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// },
// 'remove the handlers which are already bound to some event, given handler\'s
// key' : function() {
// resetTag();
// Otest = new myDom('dom3');
// Otest.addEventListener('onTestEvent1', handler1, 'Holy');
// Otest.addEventListener('TestEvent1', function() {
// alert('I am a handler!');
// }, 'God');
// Otest.addEventListener('onTestEvent1', handler3, 'tagKey');
// Otest.addEventListener('onTestEvent1', handler4, 'key_H4');
// Otest.addEventListener('onmyEvent', handler5, 'test_H5');
// Otest.addEventListener('onWontHappen', handler6, 'ghost');
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // remove handler
// Otest.removeEventListener('TestEvent1', 'Holy');
// Otest.removeEventListener('onTestEvent1', 'God')
//
// // Mock click event
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
//
// value_of(eventTarget.id).should_be('dom3');
// value_of(eventType).should_be('onTestEvent1');
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(1);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.dispose();
// Otest = null;
// },
// 'remove the handlers which are not bound to the given event, given handler\'s
// key ' : function() {
// resetTag();
// Otest = new myDom('dom4');
// Otest.addEventListener('onTestEvent1', handler1, 'Holy');
// Otest.addEventListener('onTestEvent1', function() {
// Htag2 = Htag2 + 1;
// }, 'God');
// Otest.addEventListener('onTestEvent1', handler3, 'tagKey');
// Otest.addEventListener('onTestEvent1', handler4, 'key_H4');
// Otest.addEventListener('onmyEvent', handler5, 'test_H5');
// Otest.addEventListener('onWontHappen', handler6, 'ghost');
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // remove handler
// Otest.removeEventListener('onTestEvent1', 'handler1_key');
// Otest.removeEventListener('onTestEvent1', 'ghost');
// Otest.removeEventListener('onWontHappen', 'Holy');
//
// // Mock click event
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
// Otest.dispatchEvent(new baidu.lang.Event('onWontHappen',
// Otest.domElement));
//
// value_of(eventTarget.id).should_be('dom4');
// value_of(eventType).should_be('onWontHappen');
// value_of(Htag1).should_be(1);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(1);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(1);
//
// // Reset tags and release Object
// resetTag();
// Otest.dispose();
// Otest = null;
// },
// 'remove the handlers which are not bound to the given event, given handler\'s
// function name ' : function() {
// resetTag();
// Otest = new myDom('dom3');
// Otest.addEventListener('onTestEvent1', handler1);
// Otest.addEventListener('onTestEvent1', handler2);
// Otest.addEventListener('onTestEvent1', handler3);
// Otest.addEventListener('onTestEvent2', handler4);
// Otest.addEventListener('onmyEvent', handler5);
// Otest.addEventListener('onWontHappen', handler6);
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent2',
// Otest.domElement));
// }
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // remove handler
// Otest.removeEventListener('onTestEvent1', handler4);
// Otest.removeEventListener('TestEvent1', handler1);
// Otest.removeEventListener('onTestEvent2', handler2);
// Otest.removeEventListener('onmyEvent', handler3);
//
// // Mock click event
// uiut.MockEvents.click(document.getElementById('dom3'));
//
// value_of(eventTarget.id).should_be('dom3');
// value_of(eventType).should_be('onTestEvent2');
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(1);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// },
// 'remove the handlers which are not bound to any event, given handler\'s
// function name or key ' : function() {
// resetTag();
// Otest = new myDom('dom3');
// Otest.addEventListener('onTestEvent1', handler1);
// Otest.addEventListener('onTestEvent1', handler2);
// Otest.addEventListener('onTestEvent1', handler3);
// Otest.addEventListener('onTestEvent2', handler4);
// Otest.addEventListener('onmyEvent', handler5);
// Otest.addEventListener('onWontHappen', handler6);
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
// }
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // remove handler
// Otest.removeEventListener('onTestEvent1', handler10);
// Otest.removeEventListener('TestEvent1', 'wrongHandler');
// Otest.removeEventListener('badEvent', handler1);
// Otest.removeEventListener('badEvent', 'wrongKey');
//
// // Mock click event
// uiut.MockEvents.click(document.getElementById('dom3'));
//
// value_of(eventTarget.id).should_be('dom3');
// value_of(eventType).should_be('onTestEvent1');
// value_of(Htag1).should_be(1);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// }
// });
//
// describe(
// 'baidu.lang.Class.dispatchEvent test',
// {
// 'use addEventListener to add event handler' : function() {
// resetTag();
// Otest = new myDom('dom1');
// Otest.addEventListener('onTestEvent1', handler1);
// Otest.addEventListener('onTestEvent1', handler2);
// Otest.addEventListener('onTestEvent1', handler3);
// Otest.domElement.onclick = function() {
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent1',
// Otest.domElement));
// }
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // Mock click event
// uiut.MockEvents.click(document.getElementById('dom1'));
//
// value_of(eventTarget.id).should_be('dom1');
// value_of(eventType).should_be('onTestEvent1');
// value_of(Htag1).should_be(1);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.domElement.onclick = function() {
// };
// Otest.dispose();
// Otest = null;
// },
// 'directly bind event handler' : function() {
// resetTag();
// Otest = new myDom('dom4');
// Otest.onTestEvent = handler1;
// Otest.onTestEvent = handler2;
// Otest.onTestEvent = handler3;
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // Mock click event
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent',
// Otest.domElement));
//
// value_of(eventTarget.id).should_be('dom4');
// value_of(eventType).should_be('onTestEvent');
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.dispose();
// Otest = null;
// },
// 'both directly bind event handler and use addEventListener to bind handler' :
// function() {
// resetTag();
// Otest = new myDom('dom2');
// Otest.onTestEvent = handler1;
// Otest.addEventListener('onTestEvent', handler2);
// Otest.addEventListener('TestEvent', handler3);
// Otest.onTestEvent = handler4;
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // Mock click event
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent',
// Otest.domElement));
//
// value_of(eventTarget.id).should_be('dom2');
// value_of(eventType).should_be('onTestEvent');
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(1);
// value_of(Htag3).should_be(1);
// value_of(Htag4).should_be(1);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
//
// // Reset tags and release Object
// resetTag();
// Otest.dispose();
// Otest = null;
// },
// 'the event has no handlers' : function() {
// resetTag();
// Otest = new myDom('dom3');
// Otest.onTestEvent = handler1;
// Otest.addEventListener('onTestEvent', handler2);
// Otest.addEventListener('onTestEvent', handler3);
// Otest.onTestEvent = handler4;
//
// // Mock click event
// Otest.dispatchEvent(new baidu.lang.Event('onbadEvent',
// Otest.domElement));
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(0);
// value_of(Htag4).should_be(0);
// value_of(Htag5).should_be(0);
// value_of(Htag6).should_be(0);
// value_of(eventTarget).should_be_null();
// value_of(eventType).should_be('');
//
// // Reset tags and release Object
// resetTag();
// Otest.dispose();
// Otest = null;
// },
// 'new api - options' : function() {
// function myClass() {
// this.name = "myclass";
// }
//
// baidu.lang.inherits(myClass, baidu.lang.Class);
// // 通过继承baidu.lang.Class来获取dispatchEvent方法
//
// var obj = new myClass();
// var num = 0;
//
// obj.onMyEvent = function(e) {
// if (e && e.a && e.a == "a")
// num = 1;
// else if (e && e.b && e.b == "b")
// num = 2;
// else
// num = 3;
// }
//
// obj.dispatchEvent("onMyEvent", {
// "a" : "a"
// });
// value_of(num).should_be(1);
// obj.dispatchEvent("onMyEvent", {
// "b" : "b"
// });
// value_of(num).should_be(2);
// obj.dispatchEvent("onMyEvent");
// value_of(num).should_be(3);
//
// obj.addEventListener("onMyEvent", function(e) {
// if (e && e.a && e.a == "a")
// num = 1;
// else if (e && e.b && e.b == "b")
// num = 2;
// else
// num = 3;
// });
//
// obj.dispatchEvent("onMyEvent", {
// "a" : "a"
// });
// value_of(num).should_be(1);
// obj.dispatchEvent("onMyEvent", {
// "b" : "b"
// });
// value_of(num).should_be(2);
// obj.dispatchEvent("onMyEvent");
// value_of(num).should_be(3);
//
// obj.dispatchEvent("onMyEvent", {
// "a" : "b",
// "b" : "c"
// });
// value_of(num).should_be(3);
//			
//
// obj.dispatchEvent("onMyEvent", void(0));
// value_of(num).should_be(3);
//			
// obj.dispatchEvent("onMyEvent", null);
// value_of(num).should_be(3);
// }
// });
//
// describe('baidu.lang.Event constructor test', {
// 'change different event type and event target' : function() {
// resetTag();
// Otest = new myDom('dom1');
// Otest.onTestEvent = handler1;
//
// Otest.dispatchEvent(new baidu.lang.Event('onTestEvent',
// Otest.domElement));
//
// value_of(Htag1).should_be(1);
// value_of(eventTarget.id).should_be('dom1');
// value_of(eventType).should_be('onTestEvent');
// resetTag();
//
// Otest.onmyEvent = handler2;
// Otest.dispatchEvent(new baidu.lang.Event('onmyEvent', document
// .getElementById('dom2')));
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(1);
// value_of(eventTarget.id).should_be('dom2');
// value_of(eventType).should_be('onmyEvent');
// resetTag();
//
// Otest.addEventListener('onLast', handler3);
// Otest.dispatchEvent(new baidu.lang.Event('onLast', document
// .getElementById('dom4')));
//
// value_of(Htag1).should_be(0);
// value_of(Htag2).should_be(0);
// value_of(Htag3).should_be(1);
// value_of(eventTarget.id).should_be('dom4');
// value_of(eventType).should_be('onLast');
// resetTag();
//
// Otest.dispose();
// Otest = null;
// }
// });
// describe('dispatchEvent时候传入字符串做为事件名', {
// 'dispatchEvent时候传入字符串做为事件名' : function() {
// resetTag();
// Otest = new myDom('dom1');
// Otest.onTestEvent = handler1;
//
// Otest.dispatchEvent('onTestEvent');
//
// value_of(Htag1).should_be(1);
// value_of(eventType).should_be('onTestEvent');
// resetTag();
// }
// });
