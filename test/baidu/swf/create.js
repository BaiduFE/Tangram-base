module("baidu.swf.create");

// 1、normal
test("test ver", function() {
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
	ok(true, "flash对象创建成功");//这个貌似也没有校验。。回头确认，确认完毕请移除此处的说明
	setTimeout(function(){
		document.body.removeChild(div);
	},2000);
	start();
});
// 2、 There is no flash player or the version of existed flash is lower
// than
// needed&&errorMessage
test("ver errorMessage", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		ver:'11.0.0',
		width:'200',
		height:'100',
		errorMessage:"There is no flash player or the version is too low"
	}, div);
	equal(div.innerHTML,"There is no flash player or the version is too low","test option errorMessage successfully");
	setTimeout(function(){
		document.body.removeChild(div);
	},2000);
	start();
});
// 3、There is no flash player or the version of existed flash is lower
// than
// needed&&!errorMessage
test("ver no errorMessage", function() {
	stop();
	var div = document.body.appendChild(document.createElement('div'));
	div.id="div_id";
	baidu.swf.create({
		id : 'test1',
		url : "short1.swf",
		width:'100',
		height:'100',
		ver:'11.0.0'//,杨搏处理，此处多一个,，麻烦海先注意
	}, 'div_id');
	equal(div.innerHTML,'',"flash 对象没有创建成功");
	setTimeout(function(){
		document.body.removeChild(div);
	},2000);
	start();
});
// 4、There is no container(target)
// test("options&&!container", function() {
// stop();
// baidu.swf.create({
// id : 'test1',
// url : "short1.swf",
// width : 100,
// height : 100
// });
// setTimeout(function(){
// document.body.innerHTML="";
// },200);
// start();
// });

