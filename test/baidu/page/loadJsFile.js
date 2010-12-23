module("baidu.page.loadJsFile");


test("load两个存在的JS", function() {
//expect(2);
stop();
baidu.page.loadJsFile(upath + 'jsfile1.js');
baidu.page.loadJsFile(upath + 'jsfile2.js');
var num = 0;
var isLoaded = function(){
	if(num>20){
		ok(true,"load is fail")
		start();
	}
    setTimeout(function() {
		var flag1 = false,flag2 = false;
		var k1 = loadedTest1();
		var k2 = loadedTest2();
		if(k1&&k1==1 ){
        	flag1 = true;
		}
		if(k2&&k2==2 ){
			flag2 = true;
		}
		if(flag1&&flag2){
			start();
		}
		else {
			num++;
			isLoaded();
		}
	}, 30);
};
isLoaded();

});

test("load不存在的JS", function() {
	expect(0);
	stop();
	baidu.page.loadJsFile(upath+'jsfileNotExsist.js');
	baidu.page.loadJsFile(upath+'baidu.com');
	setTimeout(function() {
		start();
	}, baidu.ie ? 300 : 50);
});
