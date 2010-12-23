module("baidu.dom.getDocument");

test("正常用例",function(){
	expect(4);
	var div = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	div.appendChild(img);
	div.id = 'div_id';
	equal(baidu.dom.getDocument(div),document,"div get document");
	equal(baidu.dom.getDocument('div_id'),document,"div get document by id");
	equal(baidu.dom.getDocument(img),document,"img get document");
	equal(baidu.dom.getDocument(document),document,"document get document");
	document.body.removeChild(div);
});

test("iframe",function(){
	ua.frameExt(function(w){
		var wd = w.baidu.dom.getDocument,
			pwd = w.parent.baidu.dom.getDocument;
		equals(wd(w.parent.document.body), w.parent.document);
		equals(pwd(w.document.body), w.document);
		this.finish();
	});
});
