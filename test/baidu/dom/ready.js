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
	expect(2);
	var f = document.createElement('iframe');
	document.body.appendChild(f);
	var step = 0;
	stop();
	window.frameload = function(w) {
		w.baidu.dom.ready(function() {
			equals(step++, 0, 'ready before onload');
			TT.on(w, 'load', function(){
				equals(step++, 1, 'onload after ready');
			});
		});
//		TT.on(w, 'load', function(){//IE6、8下，绑定事件的执行顺序并不固定，这个用例移除
//			equals(step++, 1, 'onload after ready');
//		});
	};
	f.src = upath + 'readyFrame.php?f=baidu.dom.ready';// 空页面
	setTimeout(function(){
		TT.e(f).remove();
		start();
	}, 1000);
});

test('ready after onload', function() {
	expect(2);
	stop();
	setTimeout(function() {
		var script = document.createElement('script');
		script.src = '../../tools/br/import.php?f=baidu.dom.ready';
		var fun = function(){
			if(ua.browser.ie && this.readyState == 'loaded'){
				ok(true, "onload");
				baidu.dom.ready(function() {
						ok(true, "dom ready");
						start();	
				});
			}
		};
		if(ua.browser.ie){
			script.onreadystatechange = fun; 
		}
		else{
			script.onload = fun;	
		}
		document.getElementsByTagName('head')[0].insertBefore(script, document.getElementsByTagName('head')[0].lastChild);
	}, 100);
});