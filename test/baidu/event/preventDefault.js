module("preventDefault");

test("阻止默认行为", function() {
	expect(1);
	var div = document.createElement('div');
	$(div).css('width', 5000).css('height', 200).css('border', 'solid');
	div.appendChild(img);
	document.body.appendChild(div);
	var a = document.createElement('a');
	a.setAttribute("href", "#");
	a.innerHTML = 'ToTop';
	a.target = '_self';
	document.body.appendChild(a);
	window.scrollTo(0, document.body.scrollHeight);

	UserAction.beforedispatch = function(e){
		e = e || window.event;
		baidu.event.preventDefault(e);	
	};
	UserAction.click(a);
	var top = window.pageYOffset 
    || document.documentElement.scrollTop 
    || document.body.scrollTop 
    || 0;
	ok(top != 0, "preventDefault");
	document.body.removeChild(div);
	document.body.removeChild(a);
});