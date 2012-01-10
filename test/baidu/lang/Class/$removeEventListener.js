module("baidu.lang.Class.$removeEventListener");

(function() {
	
	/* 引入_inherits */
	_inherits = function(subClass, superClass, className) {
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
})();

test("removeEventListener", function() {
	stop();
	ua.importsrc("baidu.lang.Event", function(){
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
			start();
	}, "baidu.lang.Event", "baidu.lang.Class.$removeEventListener");
});

test("removeEventListener - no key", function() {
	function myClass() {
		this.name = "myclass";
	}

	_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
	   expect(2);
		var obj = new myClass();
		function listner(){
			ok(true, "listner is added");
		}
		
		var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent", obj);
		obj.addEventListener("onMyEvent", listner);
		obj.dispatchEvent(myEventWithoutOn);
		obj.removeEventListener("onMyEvent", listner);
		obj.dispatchEvent(myEventWithoutOn);
		ok(true, "listner is removed");

	});

test("removeEventListener - no handler", function () {  // 2011-2-26, 无handler参数时移除所有事件
	function myClass() {
		this.name = "myclass";
	}

	_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
	   expect(5);
		var obj = new myClass();
		function listner1(){ok(true, "listner1 is added");}
		function listner2(){ok(true, "listner2 is added");}

		var myEventWithoutOn = new baidu.lang.Event("onMyEvent", obj);
		obj.addEventListener("onMyEvent", listner1);
		obj.addEventListener("onMyEvent", listner2);
		obj.dispatchEvent(myEventWithoutOn);
		obj.removeEventListener("onMyEvent", function(){});
		obj.dispatchEvent(myEventWithoutOn);
		obj.removeEventListener("onMyEvent");
		obj.dispatchEvent(myEventWithoutOn);
		ok(true, "listner is removed");   
});

test("removeEventListener - default params", function () {
	function myClass() {
		this.name = "myclass";
	}

	_inherits(myClass, baidu.lang.Class);// 通过继承baidu.lang.Class来获取它的dispatchEvent方法
	   expect(4);
		var obj = new myClass();
		function listner1(){ok(true, "listner1 is added");}
		function listner2(){ok(true, "listner2 is added");}

		var myEventWithoutOn = new baidu.lang.Event("onMyEvent", obj);
		var yourEventWithoutOn = new baidu.lang.Event("YourEvent", obj);
		obj.addEventListener("onMyEvent", listner1);
		obj.addEventListener("onMyEvent", listner2);
		obj.addEventListener("YourEvent", listner1);
		obj.dispatchEvent(myEventWithoutOn);
		obj.dispatchEvent(yourEventWithoutOn);  
		obj.removeEventListener("onMyEvent");
		obj.dispatchEvent(myEventWithoutOn);  
		obj.dispatchEvent(yourEventWithoutOn);  
		obj.removeEventListener();
		obj.dispatchEvent(myEventWithoutOn);  
		obj.dispatchEvent(yourEventWithoutOn);  
});