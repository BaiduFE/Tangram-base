module('baidu.event.get');

test('get', function(){
	$(document.body).append('<div id="div_test"></div>');
	$('div#div_test')[0]['onclick'] = function(e){
		e = e || window.event;
		var be = baidu.event.get(e);
		equals(e, be._event);
		equals(e.type, 'click');
	};
	
	ua.click($('div#div_test')[0]);
});