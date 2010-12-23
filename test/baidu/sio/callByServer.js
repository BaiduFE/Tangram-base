module('baidu.sio.callByServer');

test('callback is function', function() {
	stop();
	var check = function(text) {
		equals(text, 'i am from server');
		start();
	};
	baidu.sio.callByServer(upath+"callByServer.php", check);
});

test('callback is string', function() {
	stop();
	window.check_string = function(text) {
		equals(text, 'i am from server');
		start();
	};
	baidu.sio.callByServer(upath+"callByServer.php", "check_string");
});

test('charset utf-8', function() {
	stop();
	var check = function(text) {
		equals(text, '百度中文--UTF');
		start();
	};
	baidu.sio.callByServer(upath+"callByServerCharset_UTF.php", check, {
		charset : "UTF-8"
	});
});

test('charset gbk', function() {
	stop();
	var check = function(text) {
		equals(text, '百度中文--GBK');
		start();
	};
	baidu.sio.callByServer(upath+"callByServerCharset_GBK.php", check, {
		charset : "GBK"
	});
});

/**
 * 由于不存在网页不会触发回调，设置半秒超时，用例可能会有问题……
 */
test('page not exist', function(){
	stop();	
	var h, check = function(text) {
		clearTimeout(h);
		ok(false, 'call back will not call');
		start();
	};
	baidu.sio.callByServer("notexist.php", check);
	h = setTimeout(function(){
		ok(true, 'call back not call');
		start();
	}, 500);
});

/**
 * TODO
 */
// test('page not exist', function(){
//	
// });
// var serverText1 = "", serverTextFun1 = "";
// var noPageText = "", noPageTextFun = "", callbackText = "", callbackTextFun =
// "",UTFText = "",UTFTextFun = "",GBKText = "",GBKTextFun = "";
//
// function getNoPgaeServer(text){
// noPageText = text;
// }
//
// //function getServer3(text){
// // serverText3 = text;
// //}
//
// function callbackServer(text){
// callbackText = text;
// }
//
//
// function UTFServer(text){
// UTFText = text;
// }
//
// function GBKServer(text){
// GBKText = text;
// }
//
// //baidu.sio.callByServer
// //通过script标签加载数据，加载完成由服务器端触发回调
// //baidu.sio.callByServer("sio/callByServer.php", "getServer1");
// //baidu.sio.callByServer("sio/callByServer.php", function(text){
// // serverTextFun1 = text;
// //});
//
//
// //加载页面不存在
// baidu.sio.callByServer("sio/noexist.php", "getNoPgaeServer");
// baidu.sio.callByServer("sio/noexist.php", function(text){
// noPageTextFun = text;
// });
//
// //带callback参数
// baidu.sio.callByServer("sio/callByServer.php?callback=tc", upath+"callbackServer");
// baidu.sio.callByServer("sio/callByServer.php?callback=tc", function(text){
// callbackTextFun = text+"--fun";
// });
//
// //通过script标签加载数据，加载完成由服务器端触发回调,并显示UTF-8编码字符
// baidu.sio.callByServer("sio/callByServerCharset_UTF.php",
// "UTFServer",{charset:"UTF-8"});
// baidu.sio.callByServer("sio/callByServerCharset_UTF.php", function(text){
// UTFTextFun = text+"--fun";
// },{charset:"UTF-8"});
//
// //GBK编码显示正确与否
// baidu.sio.callByServer("sio/callByServerCharset_GBK.php",
// "GBKServer",{charset:"GBK"});
// baidu.sio.callByServer("sio/callByServerCharset_GBK.php", function(text){
// GBKTextFun = text+"--fun";
// },{charset:"GBK"});
//
// describe('baidu.sio.callByServer', {
// // '通过script标签加载数据，加载完成由服务器端触发回调': function(){
// // value_of(serverText1).should_be("i am from server");
// // value_of(serverTextFun1).should_be("i am from server");
// // },
// '加载页面不存在': function(){
// value_of(noPageText).should_be("");
// value_of(noPageTextFun).should_be("");
// },
// '带callback参数': function(){
// value_of(callbackText).should_be("i am from server");
// value_of(callbackTextFun).should_be("i am from server--fun");
// },
//    
// 'options_UTF': function(){
// value_of(UTFText).should_be("百度中文--UTF");
// value_of(UTFTextFun).should_be("百度中文--UTF--fun");
// },
//    
// 'options_GBK': function(){
// value_of(GBKText).should_be("百度中文--GBK");
// value_of(GBKTextFun).should_be("百度中文--GBK--fun");
// }
// });
