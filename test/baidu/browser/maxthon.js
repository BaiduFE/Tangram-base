module("baidu.browser.maxthon");

test("maxthon", function() {
	ok(true, '不支持傲游的检测');
	//TODO
	return;
	
	//遨游三拿不到相关信息，真他妹的悲剧
	//IE6的内核下显示如下
	//Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727)
//
//	try {
//		// 遨游三这个地方改掉了……
//		window.external.max_invoke("GetHotKey");
//		ok(baidu.browser.maxthon, 'is maxthon');
//	} catch (ex) {
//		equals(baidu.browser.maxthon, undefined, 'not maxthon');
//	}
});
