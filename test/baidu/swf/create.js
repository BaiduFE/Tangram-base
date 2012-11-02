module("baidu.swf.create");

test('test', function() {
	expect(1);
	stop();
	ua.importsrc("baidu.swf.getMovie", function(){
		var div = document.body.appendChild(document.createElement('div'));
		baidu.swf.create({
			id : 'test0',
			swliveconnect : 'true',
			play : 'true',
			width : 100,
			height : 100,
			url : cpath + 'flips2.swf?time=' + new Date().getTime()
		}, div);
		var swf = baidu.swf.getMovie('test0');
		var h = setInterval(function() {
			try {
				if((swf.playing || swf.GetVariable) && swf.GetVariable("/:message") == "Type something here")
					clearInterval(h);
				else
					return;
			} catch (e) {
				return;
			}
			ok(true, "swf create successfully");
			swf.StopPlay();
			$(div).remove();
			start();
		}, 100);
	}, "baidu.swf.getMovie", "baidu.swf.create");
});

test('test, no target', function() {
	expect(1);
	stop();
	baidu.swf.create({
		id : 'test0',
		swliveconnect : 'true',
		play : 'true',
		width : 100,
		height : 100,
		url : cpath + 'flips2.swf?time=' + new Date().getTime()
	});
	var swf = baidu.swf.getMovie('test0');
	var h = setInterval(function() {
		try {
			if((swf.playing || swf.GetVariable) && swf.GetVariable("/:message") == "Type something here")
				clearInterval(h);
			else
				return;
		} catch (e) {
			return;
		}
		ok(true, "swf create successfully");
		swf.StopPlay();
		$('#test0').remove();
		start();
	}, 100);
});