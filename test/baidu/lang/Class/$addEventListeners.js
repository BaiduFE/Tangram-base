module("baidu.lang.Class.$addEventListeners");
(function() {
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

	test("1个参数，没有挂载函数", function() {
		expect(2);
		function myClass() {
			this.name = "myclass";
		}
		_inherits(myClass, baidu.lang.Class);

		var obj = new myClass();
		var myEvent1 = function() {
			ok(true, "myEvent1 dispatched");
		};
		var myEvent2 = function() {
			ok(true, "myEvent2 dispatched");
		};
		var events = {
			"onMyEvent1" : myEvent1,
			"onMyEvent2" : myEvent2
		};
		obj.addEventListeners(events);
		obj.dispatchEvent("onMyEvent1");
		obj.dispatchEvent("onMyEvent2");
	});

	test("2个参数，有挂载函数", function() {
		expect(3);
		function myClass() {
			this.name = "myclass";
		}
		_inherits(myClass, baidu.lang.Class);

		var obj = new myClass();
		var myEvent = function() {
			ok(true, "myEvent dispatched");
		};
		// var myEvent1 = function(){
			// ok(true,"myEvent1 dispatched");
			// };
			// var myEvent2 = function(){
			// ok(true,"myEvent2 dispatched");
			// };
			obj.addEventListeners("onMyEvent", myEvent);// 添加1个事件侦听器
			obj.addEventListeners("onMyEvent1,onMyEvent2", myEvent);// 增加2个事件侦听器
			obj.dispatchEvent("onMyEvent");
			obj.dispatchEvent("onMyEvent1");
			obj.dispatchEvent("onMyEvent2");
		});

	test("参数不合法", function() {
		expect(0);
		function myClass() {
			this.name = "myclass";
		}
		_inherits(myClass, baidu.lang.Class);

		var obj = new myClass();
		var myEvent = function() {
			ok(true, "myEvent dispatched");
		};
		var events = [ "event1", "event2" ];// 没有设置响应函数
			obj.addEventListeners("onMyEvent", "onMyEvent2", myEvent);// 预期2个参数，实际3个，不会执行函数体
			obj.dispatchEvent("onMyEvent");
			obj.dispatchEvent("event1");// 不会响应
			obj.dispatchEvent("event2");
		});
})();