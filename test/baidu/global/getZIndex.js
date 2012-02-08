module("baidu.global.getZIndex");

test("common", function(){
	expect(6);
	equals(baidu.global.get('zIndex')['dialog'], 1000, "The base dialog zIndex is right");
	equals(baidu.global.get('zIndex')['popup'], 50000, "The base popup zIndex is right");
	equals(baidu.global.getZIndex('dialog', 5), 1005, "The dialog zIndex is right");
	equals(baidu.global.getZIndex('popup', 5), 50005, "The popup zIndex is right");
	equals(baidu.global.getZIndex('dialog'), 1006, "The dialog zIndex is right");
	equals(baidu.global.getZIndex('popup'), 50006, "The popup zIndex is right");
});