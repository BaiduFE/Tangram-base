module("baidu.browser.maxthon");

test("maxthon", function() {
	    try{
	        window.external.max_invoke("GetHotKey");
	        ok(baidu.browser.maxthon, 'is maxthon');
	    }catch(ex){
	        equals(baidu.browser.maxthon, undefined, 'not maxthon');
	    }
});
