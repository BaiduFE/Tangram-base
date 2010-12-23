module('baidu.dom.setAttrs')

test('基础测试', function() {
	expect(3);
	var img = document.createElement('img');
	var attrs = {"align":"right", "width":30, "height":20};
	baidu.dom.setAttrs(img,attrs);
	equal(img.getAttribute('align'),'right',"img gets align");
	equal(img.getAttribute('width'),30,"img gets width attribute");
	equal(img.getAttribute('height'),20,"img gets height attribute");
});

test('shortcut',function(){
	expect(3);
	var img = document.createElement('img');
	var attrs = {"align":"right", "width":30, "height":20};
	baidu.setAttrs(img,attrs);
	equal(img.getAttribute('align'),'right',"img gets align");
	equal(img.getAttribute('width'),30,"img gets width attribute");
	equal(img.getAttribute('height'),20,"img gets height attribute");
})