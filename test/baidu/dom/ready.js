module('baidu.dom.ready');

test('页面载入完毕后调用该方法？', function() {
	stop();
	expect(1);
	baidu.dom.ready(function() {
		ok(true);
		start();
	});
});

test('dom ready for none ie', function() {
	if (!ua.browser.ie) {
		expect(1);
		window.iframeReady = false;// 子窗口中通过baidu.dom.ready尝试改变这个值用于确认函数是否正确执行
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		stop();
		iframe.src = UserAction.commonData['datadir'] + 'testReady.html';// 文件位置在test/tools/data下
		var clear = function(handle) {
			clearInterval(handle);
			// delete window.iframeReady;
			// document.body.removeChild(iframe);
			start();
		}
		var count = 0;
		/***********************************************************************
		 * 加载的iframe会尝试更新当前窗口中的变量iframeReady，预计超时时间为5s
		 **********************************************************************/
		var handle = setInterval(function() {
			if (window.iframeReady) {
				ok(window.iframeReady, 'iframe is ready');
				clear(handle);
			} else if (count > 250) {
				ok(window.iframeReady, 'time out wait for ready');
				clear(handle);
			} else
				count++;
		}, 20)
	} else
		ok(true, 'IE下不支持子窗口');
})