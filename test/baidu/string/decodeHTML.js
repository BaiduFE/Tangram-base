module("baidu.string.decodeHTML 测试");

/**
 * transfer html code to entity, "&lt;" for "<" or "&quot;" for """ and so on
 * use two function(baidu.string.decodeHTML() and baidu.decodeHTML())
 */

test('将<>"&的实体字符转义成html字符', function(){
	var strDecodeHTML = "";
	
	strDecodeHTML = baidu.string.decodeHTML('&lt;&gt;&quot;&amp;');
	equals(strDecodeHTML, '<>"&');
	
	strDecodeHTML = baidu.string.decodeHTML('&lt;input type=&quot;text&quot; value=&quot;data&quot;/&gt;');
	equals(strDecodeHTML, '<input type="text" value="data"/>');
	
	strDecodeHTML = baidu.string.decodeHTML('&amp;amp;&amp;&lt;&lt;&lt;&gt;&gt;');
	equals(strDecodeHTML, '&amp;&<<<>>');
	
	strDecodeHTML = baidu.string.decodeHTML('&#12345;');
	equals(strDecodeHTML, '〹');
	
	strDecodeHTML = baidu.string.decodeHTML('hi,all&#22909;&#30340;,&#36825;&#20010;javascript&#19981;&#38169;');
	equals(strDecodeHTML, 'hi,all好的,这个javascript不错');
});

test("快捷方式测试", function(){
	var strDecodeHTML = "";
	
	strDecodeHTML = baidu.decodeHTML('&lt;&gt;&quot;&amp;');
	equals(strDecodeHTML, '<>"&');
	
	strDecodeHTML = baidu.decodeHTML('&lt;input type=&quot;text&quot; value=&quot;data&quot;/&gt;');
	equals(strDecodeHTML, '<input type="text" value="data"/>');
			
	strDecodeHTML = baidu.decodeHTML('&amp;amp;&amp;&lt;&lt;&lt;&gt;&gt;');
	equals(strDecodeHTML, '&amp;&<<<>>');
});


//describe('baidu.decodeHTML测试', {
//	'将<>"&的实体字符转义成html字符': function() {
//		value_of(baidu.string.decodeHTML('&lt;&gt;&quot;&amp;')).
//			should_be('<>"&');
//		value_of(baidu.string.decodeHTML('&lt;input type=&quot;text&quot; value=&quot;data&quot;/&gt;')).
//			should_be('<input type="text" value="data"/>');
//		value_of(baidu.string.decodeHTML('&amp;amp;&amp;&lt;&lt;&lt;&gt;&gt;')).
//			should_be('&amp;&<<<>>');
//		value_of(baidu.string.decodeHTML('&#12345;')).
//			should_be('〹');
//		value_of(baidu.decodeHTML('hi,all&#22909;&#30340;,&#36825;&#20010;javascript&#19981;&#38169;'))
//			.should_be('hi,all好的,这个javascript不错');
//	},
//    '快捷方式测试': function () {
//        value_of(baidu.decodeHTML('&lt;&gt;&quot;&amp;')).
//			should_be('<>"&');
//		value_of(baidu.decodeHTML('&lt;input type=&quot;text&quot; value=&quot;data&quot;/&gt;')).
//			should_be('<input type="text" value="data"/>');
//		value_of(baidu.decodeHTML('&amp;amp;&amp;&lt;&lt;&lt;&gt;&gt;')).
//			should_be('&amp;&<<<>>');
//    }
//});
