module("测试getMovie");

test("输入文件中存在的flash的name", function() {
	stop();
	ua.importsrc('baidu.swf.create', function() {
		var div = document.body.appendChild(document.createElement('div'));
		var div1 = document.body.appendChild(document.createElement('div'));
		setTimeout(function() {
			baidu.swf.create( {
				id : 'test1',
				width : 100,
				height : 100
			}, div);
			var swf = baidu.swf.getMovie('test1');
			if(ua.browser.opera)equals(swf.outerHTML.match('test1'), 'test1');//opara 下swf.name显示为undifined，opera不支持embed的name
			else equals(ua.browser.ie ? swf.id : swf.name, 'test1');//ua.browser.ie == 6 ? swf.id : swf.name, 'test1'	
			
			baidu.swf.create( {
				id : 'test1',
				width : 100,
				height : 100
			}, div1);
			
			equals(baidu.swf.getMovie('test1').length , 2);
			start();
		}, 500);
	}, 'baidu.swf.create', 'baidu.swf.getMovie');
});

test("输入文件中不存在的flash的name", function() {
	var f1 = baidu.swf.getMovie("flashNotExist");
	equals(f1, undefined, 'input is not exist name');
});

test("输入空字符串", function() {
	var f1 = baidu.swf.getMovie("");
	equals(f1, undefined, 'input is null string');
});

// //baidu.swf.getMovie test code
// var getflash = baidu.swf.getMovie;
// describe('测试getMovie',{
// '输入文件中存在的flash的name':function(){
// f1 = getflash('flash1');
// var handle = setInterval(function(){
// if(f1){
// clearInterval(handle);
// tmpname =
// f1.getAttribute('id')?f1.getAttribute('id'):f1.getAttribute('name');
// tmpname1 = f1.id?f1.id:f1.name;
// flashname = tmpname||tmpname1;
// flashsrc = f1.movie?f1.movie:f1.src;
// value_of(flashname).should_be('flash1');
// value_of(flashsrc).should_match(/swf\/long1.swf/i);
// f2 = getflash('flash2');
//
//                
// tmpname =
// f2.getAttribute('id')?f2.getAttribute('id'):f2.getAttribute('name');
// tmpname1 = f2.id?f2.id:f2.name;
// flashname = tmpname||tmpname1;
// flashsrc = f2.movie?f2.movie:f2.src;
// value_of(flashname).should_be('flash2');
// value_of(flashsrc).should_match(/swf\/long1.swf/i);
// f3 = getflash('flash3');
//
//                
// tmpname =
// f3.getAttribute('id')?f3.getAttribute('id'):f3.getAttribute('name');
// tmpname1 = f3.id?f3.id:f3.name;
// flashname = tmpname||tmpname1;
// flashsrc = f3.movie?f3.movie:f3.src;
// value_of(flashname).should_be('flash3');
// value_of(flashsrc).should_match(/swf\/short1.swf/i);
// }
// },20)
//        
// },
// '输入文件中不存在的flash的name':function(){
// f1 = getflash('flashNotExisist');
// value_of(f1).should_be_undefined();
// },
//
// '输入空字符串':function(){
// f1 = getflash('');
// value_of(f1).should_be_undefined();
// }
// });
