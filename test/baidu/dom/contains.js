module("baidu.dom.contains")

test("父子关系",function(){
	expect(9);
	var div = document.createElement('div');
	div.id = "father_div";
	var divChild = document.createElement('div');
	divChild.id = "child_div";
	var img = document.createElement('img');
	img.setAttribute('id',"img_id");
	var text = document.createTextNode('text node');
	var aGrand = document.createElement('a');
	document.body.appendChild(div);
	div.appendChild(divChild);
	div.appendChild(img);
	div.appendChild(text);
	divChild.appendChild(aGrand);
	
	ok(baidu.dom.contains(div,divChild),"div contains child div");
	ok(baidu.dom.contains(div,img),"div contains img");
	/**
	 * 不支持textNode，因为在ie下有问题，兼容这个问题需要花费很大的精力，因此不做处理
	 * ok(baidu.dom.contains(div,text),"div contains text");//text node
	 */
	ok(baidu.dom.contains(divChild,aGrand),"child div contains a");//grand child
	ok(baidu.dom.contains(document.body,div),"body contains div");//body
	
	ok(baidu.dom.contains(div,aGrand),"grandfather contains grandson");
	ok(baidu.dom.contains('father_div',aGrand),"grandfather contains grandson-by id");
	ok(baidu.dom.contains("father_div",divChild),"div contains child div--father by id");//id
	ok(baidu.dom.contains(div,"child_div"),"div contains child div--child by id");//id
	ok(baidu.dom.contains("father_div","child_div"),"div contains child div--both by id");//id
	div.removeChild(divChild);
	document.body.removeChild(div);
});

test("非父子关系",function(){
	expect(5);
	var div = document.createElement('div');
	var a = document.createElement('a');
	var div1 = document.createElement('div');
	var img = document.createElement('img');
	document.body.appendChild(div);
	document.body.appendChild(div1);
	document.body.appendChild(a);
	div.appendChild(img);
	
	ok(!baidu.dom.contains(div,div),"can't contains self");//self
	ok(!baidu.dom.contains(div,div1),"div doesn't contain sibling div");//sibling
	ok(!baidu.dom.contains(div,a),"div doesn't contain sibling a");//sibling
	ok(!baidu.dom.contains(div1,img),"div1 doesn't contain relative img");//relative
	ok(!baidu.dom.contains(a,img),"a doesn't contain relative img");//relative
	
	document.body.removeChild(div);
	document.body.removeChild(div1);
	document.body.removeChild(a);
});

test("iframe",function(){
	expect(3);
	stop();
//	debugger
	var f = document.createElement('iframe');
	var div = document.createElement('div');
	document.body.appendChild(div);
	div.appendChild(f);
	f.src = cpath+'test.html';
	$(f).load(function(){//rendy发生在“网页本身的html”载入后就触发；load会等到“网页html标签中引用的图档、内嵌物件（如flash）、iframe”等拉哩拉杂的东西都载入后才会触发
		if(f.contentWindow.document&&f.contentWindow.document.body){
//				clearInterval(handle);
			var doc = f.contentWindow.document;
			var divFrame = doc.createElement('div');
			var imgFrame = doc.createElement('img');
			doc.body.appendChild(divFrame);
			divFrame.appendChild(imgFrame);
			ok(!baidu.dom.contains(div,divFrame),"div doesn't contain div in iframe");
			ok(baidu.dom.contains(div,f),"div contains iframe");
			ok(baidu.dom.contains(divFrame,imgFrame),"in iframe,div contains img");//in frame, div contains img
			document.body.removeChild(div);
			start();
		}
	});	

});

test('异常case',function(){
	var div = document.createElement('div');
	var divChild = document.createElement('div');
	document.body.appendChild(div);
	div.appendChild(divChild);
	div.id = "div_id";
	divChild.id = "div_id";
	ok(!baidu.dom.contains(div,"div_id"),"father and child have the same id--1");
	ok(!baidu.dom.contains("div_id",div),"father and child have the same id--2");
	ok(baidu.dom.contains(div,divChild),"father and child have the same id--3");
	ok(!baidu.dom.contains("div_id","div_id"),"father and child have the same id--4");
	document.body.removeChild(div);
});


/*ff下会抛异常*/
//test("异常用例",function(){
//	var div = document.createElement('div');
//	ok(!baidu.dom.contains(div,'nullElement'),"div doesn't contain not existed element");
//	ok(!baidu.dom.contains(div,null),"div doesn't contain null");
//	ok(!baidu.dom.contains(div,undefined),"div doesn't contain undefined");
//})

