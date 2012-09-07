module("baidu.dom.opacity");

test('set form null to 0.5',function(){
	expect(1);
	var div = document.createElement('div');
	document.body.appendChild(div);
    $(div).css('left', '0').css('top', '0').css('height', '10px')
    .css('width', '10px').css('backgroundColor','red');
	baidu.dom.opacity(div, 0.5);
	if(ua.browser.ie){
		equals(div.style.filter, "progid:DXImageTransform.Microsoft.Alpha(opacity=50)", "from '' to 0.5");
	} else{
		equals(div.style.opacity, 0.5, "from '' to 0.5");
	}
	document.body.removeChild(div);
});

test('set form 0.1 to 1',function(){
	expect(1);
	var div = document.createElement('div');
	document.body.appendChild(div);
    $(div).css('left', '0').css('top', '0').css('height', '10px')
    .css('width', '10px').css('backgroundColor','red').css('opacity', '0.1');
	baidu.dom.opacity(div, 1);
	if(ua.browser.ie){
		equals(div.style.filter, "progid:DXImageTransform.Microsoft.Alpha(opacity=100)", "from 0.1 to 1");
	} else{
		equals(div.style.opacity, 1, "from 0.1 to 1");
	}
	document.body.removeChild(div);
});

