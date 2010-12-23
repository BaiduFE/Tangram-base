module("baidu.browser.chrome")

test("chrome", function() {
	expect(1);
	if (baidu.browser.chrome) {
		var browser = navigator.userAgent;
		if (/chrome\/(\d+\.\d)/i.test(browser)){
			ok(true, "this browser is chrome");
	}
	} else{
		if(!/chrome\/(\d+\.\d)/i.test(browser))
		ok(true, "this borwser is not chrome");
	}
		
})