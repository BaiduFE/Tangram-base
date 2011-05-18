module('baidu.dom.ready');

test('页面载入完毕后调用该方法？', function() {
	stop();
	expect(1);
	baidu.dom.ready(function() {
		ok(true);
		start();
	});
});

test('ready before onload', function() {
	var f = document.createElement('iframe');
	document.body.appendChild(f);
	var step = 0;
	stop();
	ua.onload = function(w) {
		w.baidu.dom.ready(function() {
			equals(step++, 0, 'ready before onload');
			TT.on(w, 'load', function(){
				equals(step++, 2, 'onload after ready');
			});
		});
		TT.on(w, 'load', function(){
			equals(step++, 1, 'onload after ready');
		});
		debugger;
	};
	f.src = cpath + 'frame.php?f=baidu.dom.ready';// 空页面
	setTimeout(function(){
		TT.e(f).remove();
		start();
	}, 2000);
});