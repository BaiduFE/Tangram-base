module("baidu.url.escapeSymbol测试");

// import("baidu.ajax");
// import("baidu.ajax.request");

test("字符串只含有转义的七个字符", function() {
	equals(baidu.url.escapeSymbol("%"), "%25", '% is included in string');
	equals(baidu.url.escapeSymbol("&"), "%26", '& is included in string');
	equals(baidu.url.escapeSymbol("+"), "%2B", '+ is included in string');
	equals(baidu.url.escapeSymbol("/"), "%2F", '/ is included in string');
	equals(baidu.url.escapeSymbol("#"), "%23", '# is included in string');
	equals(baidu.url.escapeSymbol("="), "%3D", '= is included in string');
	equals(baidu.url.escapeSymbol(" "), "%20", '  is included in string');
});

test(
		"含有转义的七个字符的字符串正常转义",
		function() {
			equals(baidu.url
					.escapeSymbol("aQ1!%sW2@&dE3$+fR4^/gT5*#hY6(=jU7) "),
					"aQ1!%25sW2@%26dE3$%2BfR4^%2FgT5*%23hY6(%3DjU7)%20",
					'% & + / # =   is included in string(for english char)');
			equals(baidu.url.escapeSymbol("这%是&中文+吗/好像有点#像=你说 呢"),
					"这%25是%26中文%2B吗%2F好像有点%23像%3D你说%20呢",
					'% & + / # =   is included in string(for chinese char)');
			equals(
					baidu.url
							.escapeSymbol("％%＆&＋+、/＃#＝=　 ａＡｑＷ%\t&\a+\b/\f#\?=\r \%\&\+\/\#\=\ "),
//					"％%25＆%26＋%2B、%2F＃%23＝%3D　%20ａＡｑＷ%25\t%26\a"
//							+ "%2B\b%2F\f%23\?%3D\r%20\%25\%26\%2B\%2F\%23\%3D\%20",
					//escapeSymbol升级之后，\s也被转义（\s匹配任意的空白符，包括空格，中文全角空格，制表符(\t \v)，换行符(\n)，回车符(\r)，换页符(\f)）
					"％%25＆%26＋%2B、%2F＃%23＝%3D%100%20ａＡｑＷ%25%09%26a%2B\b%2F%0C%23?%3D%0D%20%25%26%2B%2F%23%3D%20",
					'% & + / # = /s is included in string(quan jiao zi fu)');
		});

test("没有这七个字符，有空白符", function() {
	equals(baidu.url.escapeSymbol("aQ1!sW2@dE3$fR4^gT5*hY6(jU7)"),
			"aQ1!sW2@dE3$fR4^gT5*hY6(jU7)",
			'% & + / # =   is not included in string(for english char)');
	equals(baidu.url.escapeSymbol("这是中文吗好像有点像你说呢"), "这是中文吗好像有点像你说呢",
			'% & + / # =   is not included in string(for english char)');
	equals(baidu.url.escapeSymbol("％＆＋、＃＝　ａＡｑＷ\t\a\b\f\?\r\n"),
//			"％＆＋、＃＝　ａＡｑＷ\t\a\b\f\?\r",
			//escapeSymbol升级之后，\s也被转义（\s匹配任意的空白符，包括空格，中文全角空格，制表符(\t \v)，换行符(\n)，回车符(\r)，换页符(\f)）
			//因为IE不支持\v，所以不测试\v
			"％＆＋、＃＝\%100ａＡｑＷ\%09\a\b\%0C\?\%0D\%0A",
			'% & + / # =   is not included in string(quan jiao zi fu)');
});

// test(
// "确认除此外的其他字符不需要转义",
// function() {
// var _url, text, xhr, url = upath + "escapeSymbol.php?";
// var urlparms = [], url1 = [];
// var list = [ "20", "23", "25", "26", "2b", "2f", "3d" ];
// var _listchar = ' ' + list.join(' ') + ' ';
// for ( var i = 32; i < 127; i++) {
// var hex = i.toString(16);
// var chr = String.fromCharCode(i);
// if (_listchar.indexOf(' ' + hex + ' ') >= 0)
// continue;
// urlparms.push(chr);
// }
// stop();
// _url = url + urlparms.join('');
// $
// .ajax({
// url : _url,
// success : function(data) {
// equals(
// data,
// "!\"$'()*,-.0123456789:;<>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~");
// start();
// }
// });
// // },
// // 'async': false
// // });
// });
