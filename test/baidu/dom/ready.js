module('baidu.dom.ready')

test('ready', function() {
	expect(1);
	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	stop();
	iframe.src = UserAction.commonData['datadir'] + 'testReady.html';
	window.iframeReady = false;
	var clear = function(handle) {
		clearInterval(handle);
		delete window.iframeReady;
		document.body.removeChild(iframe);
		start();
	}
	var count = 0;
	/***************************************************************************
	 * 加载的iframe会尝试更新当前窗口中的变量iframeReady，预计超时时间为1s
	 **************************************************************************/
	var handle = setInterval(function() {
		if (window.iframeReady) {
			ok(window.iframeReady, 'iframe is ready');
			clear(handle);
		} else if (count > 50) {
			ok(window.iframeReady, 'time out wait for ready');
			clear(handle);
		} else
			count++;
	}, 20)
})
