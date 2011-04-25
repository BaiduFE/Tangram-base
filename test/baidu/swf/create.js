module("baidu.swf.create");


//error1  width and height only on IE 只有当设置width和height时，IE下才出来flash
test("width height", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	div.id = "div_id";
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
//		width:'100',
//		height:'100',
		align:'right',
		bgcolor:'#FFCC80'
	}, div);
	ok(true, "flash对象创建成功");
	start();
});
//error2  loop menu play都达不到应有的效果，wmode三个设置值好像没有区别
test("loop menu play wmode", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		width:'100',
		height:'100',
		loop:true,
		menu:true,
		play:true,
		wmode:"window"
	}, div);
	ok(true, "flash对象创建成功");
	start();
});
//error3  align='middle'达不到应有的效果
test("loop menu play wmode", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		width:'100',
		height:'100',
		align:'middle'
	}, div);
	ok(true, "flash对象创建成功");
	start();
});
//1、options.ver needed lower than existed flash version
test("ver errorMessage", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	div.id = "div_id";
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		width:'100',
		height:'100',
		ver:'6.0.0'
	}, div);
	ok(true, "flash对象创建成功");
	start();
});
//2、 There is no flash player or the version of existed flash is lower than needed&&errorMessage
test("ver errorMessage", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		ver:'11.0.0',
		errorMessage:"flash player 没安装或者版本低于需要的版本 "
	}, "div_id");
	start();
});
//3、There is no flash player or the version of existed flash is lower than needed&&!errorMessage
test("ver errorMessage", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		ver:'11.0.0',
	}, div);
	equal(div.innerHTML,'',"flash 对象没有创建成功");
	start();
});
//4、width height
test("ver errorMessage", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	div.id = "div_id";
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		width:'900',
		height:'900'
	}, div);
	ok(true, "flash对象创建成功");
	start();
});
//5、There is no container(target)
test("options&&!container", function() {
stop();
var div = document.body.appendChild(document.createElement('div'));
baidu.swf.create({
	id : 'test1',
	url : "short1.swf",
	width : 100,
	height : 100
});
start();
});

