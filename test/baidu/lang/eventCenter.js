module("baidu.lang.eventCenter");

(function() {
	var s = document.createElement("script");
	document.head.appendChild(s);
	s.type = "text/javascript";
	s.src = "../../../src/baidu/lang/Class/$removeEventListener";
	
	// 1
	test("add dispatch remove", function() {
		function listner1() {
			ok(true, "listner1 is added");
		}
		function listner2() {
			ok(true, "listner2 is added");
		}
		function listner3() {
			ok(true, "listner3 is added");
		}
		var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent");
		baidu.lang.eventCenter.addEventListener("onMyEvent", listner1);
		baidu.lang.eventCenter.addEventListener("onMyEvent", listner2,
				"listner2");// add eventlistener with key
		baidu.lang.eventCenter
				.addEventListener("MyEvent", listner3, "listner3");// event
																	// name does
																	// not start
																	// with 'on'
		baidu.lang.eventCenter.dispatchEvent("onMyEvent");// 3 listners will
															// react on the
															// dispatch
		baidu.lang.eventCenter.removeEventListener("onMyEvent", listner1);// remove
																			// event
																			// listener
																			// by
																			// eventlistener
																			// function
		baidu.lang.eventCenter.dispatchEvent(myEventWithoutOn);// dispatch
																// eventlistener
																// by event
																// object
		baidu.lang.eventCenter.removeEventListener("onMyEvent", "listner2");// remove
																			// eventlistener
																			// by
																			// key
		baidu.lang.eventCenter.addEventListener("onMyEvent", listner1);
		baidu.lang.eventCenter.dispatchEvent("onMyEvent");// listner1 and
															// listner2 will
															// react
		baidu.lang.eventCenter.removeEventListener("onMyEvent");// all of the
																// eventListeners
																// will be
																// removed
		baidu.lang.eventCenter.dispatchEvent("onMyEvent");
	});
	// 2 constant dispatch event
	test("constant dispatch event and the prefix of event name is not 'on'",
			function() {

				function listner1() {
					ok(true, "listner1 is added");
				}

				baidu.lang.eventCenter.addEventListener("MyEvent", listner1);
				baidu.lang.eventCenter.dispatchEvent("MyEvent");
				baidu.lang.eventCenter.dispatchEvent("MyEvent");
				baidu.lang.eventCenter.dispatchEvent("MyEvent");
				baidu.lang.eventCenter.removeEventListener("onMyEvent");
				baidu.lang.eventCenter.dispatchEvent("MyEvent");
			});
	// 3 dispatch with options
	test("dispatch event with options", function() {

		function listner1() {
			ok(true, "listner1 is added");
		}

		var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent");
		baidu.lang.eventCenter.addEventListener("onMyEvent", listner1);
		baidu.lang.eventCenter.dispatchEvent(myEventWithoutOn, {
			a : 123
		});
		baidu.lang.eventCenter.removeEventListener("onMyEvent");

	});
	// 4 remove a listener which did not regist the event
	test("remove EventListener without handler function or key", function() {

		function listner1() {
			ok(true, "listner1 is added");
		}
		function listner2() {
			ok(true, "listner2 is added");
		}
		var myEventWithoutOn = new (baidu.lang.Event)("onMyEvent");
		baidu.lang.eventCenter.addEventListener("onMyEvent", listner1);
		baidu.lang.eventCenter.dispatchEvent(myEventWithoutOn);
		baidu.lang.eventCenter.removeEventListener("onMyEvent", listner2);
		baidu.lang.eventCenter.dispatchEvent(myEventWithoutOn);

	});
})();
