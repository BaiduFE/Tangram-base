module("baidu.global.getZIndex");

test("common", function(){
	expect(4);
	equals(baidu.global.get('zIndex')['dialog'], 1000, "The base dialog zIndex is right");
	equals(baidu.global.get('zIndex')['popup'], 50000, "The base popup zIndex is right");
	equals(baidu.global.getZIndex('dialog'), 1001, "The dialog zIndex is right");
	equals(baidu.global.getZIndex('popup', 10), 50010, "The popup zIndex is right");
});