module('baidu.event.getEvent');

test('mouse event', function(){
	expect(1);
	$(document.body).append('<div id="div_test"></div>');
	$('div#div_test').click(function (){
		function test(){
			var targetId = ua.browser.ie && ua.browser.ie < 9 ? baidu.event.getEvent().srcElement.id : baidu.event.getEvent().target.id
			equals(targetId, "div_test", "ok");
		}
		test();
	});
	ua.click($('div#div_test')[0]);
});

test('key event', function(){
	expect(1);
	$(document.body).append('<div id="div_test"></div>');
	$('div#div_test').keydown(function(){
		function test(){
			var targetId = ua.browser.ie && ua.browser.ie < 9 ? baidu.event.getEvent().srcElement.id : baidu.event.getEvent().target.id
			equals(targetId, "div_test", "ok");
		}
		test();
	});
	ua.keydown($('div#div_test')[0]);
});

test('html event', function(){
	expect(1);
	$(document.body).append('<div id="div_test"></div>');
	$("#div_test").resize(function(){
		function test(){
			equals(baidu.event.getEvent(), null, "should be null");
		}
		test();
	});
	$("#div_test").resize()
});

test('other event', function(){
	expect(4);
	$(document.body).append('<div id="div_test"></div>');
	(function (){
		(function(){
			//这儿应该什么都不是
			equals(baidu.event.getEvent(), null, "should be null");
		})();
		function test(){ 
			equals(baidu.event.getEvent(), null, "should be null");
		}; test();
		equals(baidu.event.getEvent(), null, "should be null");
	})();
	function test1(){
		function test2(){
			equals(baidu.event.getEvent(), null, "should be null");
		};
		test2();
	};test1();
});