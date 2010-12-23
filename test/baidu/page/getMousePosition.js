module("baidu.page.getMousePosition");

test("get mouse position", function() {
	var p = baidu.page.getMousePosition;
	equals(p().x, 0);
	equals(p().y, 0);
	ua.mousemove(document.body, {
		clientX : 20,
		clientY : 20
	});
	equals(p().x, 20);
	equals(p().y, 20);
});