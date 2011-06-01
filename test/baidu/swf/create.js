module("baidu.swf.create");

test('test', function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	baidu.swf.create({
		id : 'test0',
		swliveconnect : 'true',
		play : 'true',
		width : 100,
		height : 100,
		url : cpath + 'flips2.swf?time=' + new Date().getTime()
	}, div);
	var swf = TT.swf.getMovie('test0');
	var h = setInterval(function() {
		try {
			if (swf.Playing)
				clearInterval(h);
			else if (swf.GetVariable
					|| TT.swf.getMovie('test0').GetVariable("/:message"))
				clearInterval(h);
			else
				return;
		} catch (e) {
			return;
		}
		equals(swf.GetVariable("/:message"), 'Type something here',
				'swf create success');
		swf.StopPlay();
		TT.e(div).remove();
		start();
	}, 100);
});
