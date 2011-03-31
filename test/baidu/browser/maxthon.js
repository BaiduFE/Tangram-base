module("baidu.browser.maxthon");

test("maxthon", function() {
	    try{
	    	//遨游三这个地方改掉了……
	        window.external.max_invoke("GetHotKey");
	        ok(baidu.browser.maxthon, 'is maxthon');
	    }catch(ex){
	    	if(baidu.browser.maxthon == 3)
	    		ok(true, '傲游3居然也抛异常……');
	        equals(baidu.browser.maxthon, undefined, 'not maxthon');
	    }
});
