module('baidu.dom.ready')

test('ready',function(){
	expect(1);
	var iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	stop();
	iframe.src = UserAction.commonData['datadir']+'testReady.html';
//	alert(iframe.src);
	window.iframeReady = false;
	var count = 0;
	/**通过判断
	 * iframe.contenWindow&&iframe.contentWindow.document&&iframe.contentWindow.document.body
	 * 不能保证iframe已经被加载完全**/
	var handle = setInterval(function(){
		if(window.iframeReady||count > 14){
			clearInterval(handle);
			ok(window.iframeReady,'iframe is ready');
			document.body.removeChild(iframe);
			start();
		}
		else if(count > 14){
			clearInterval(handle);
			ok(false,'fail to call ready--timeout');
			document.body.removeChild(iframe);
			start();
		}
		else count++;
	},20)
	
//	setTimeout(function(){
//		ok(window.iframeReady,'iframe is ready');
//		start();
//	},100);

})

