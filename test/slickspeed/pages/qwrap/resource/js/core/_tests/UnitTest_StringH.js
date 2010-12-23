
(function(){

var StringH=QW.StringH;
describe('StringH', {
	'StringH Members': function() {
		value_of(StringH).should_have_method('trim');
		value_of(StringH).should_have_method('subByte');
	},

	'trim': function() {
		value_of(StringH.trim("  aaa  ")).should_be("aaa");
	},	
	'mulReplace': function() {
		value_of(StringH.mulReplace("ab",[["a","A"],["b","B"]])).should_be("AB");
	},	
	'format': function() {
		value_of(StringH.format("I'm {0}.","JK")).should_be("I'm JK.");
	},	
	'tmpl': function() {
		value_of(StringH.tmpl("I'm {$0}.",["JK"])).should_be("I'm JK.");
	},	
	'contains': function() {
		value_of(StringH.contains("abc","bc")).should_be(true);
		value_of(StringH.contains("abc","bd")).should_be(false);
	},	
	'dbc2sbc': function() {
		value_of(StringH.dbc2sbc("ＢＣ１")).should_be("BC1");
	},	
	'byteLen': function() {
		value_of(StringH.byteLen("中国a")).should_be(5);
	},	
	'subByte': function() {
		value_of(StringH.subByte("中国a",3)).should_be("中");
		value_of(StringH.subByte("中国人民",6,'…')).should_be("中国…");
		value_of(StringH.subByte("中国人民",8,'…')).should_be("中国人民");
		value_of(StringH.subByte("中国人民",9,'…')).should_be("中国人民");
	},	
	'camelize': function() {
		value_of(StringH.camelize("bg-color")).should_be("bgColor");
	},	
	'decamelize': function() {
		value_of(StringH.decamelize("bgColor")).should_be("bg-color");
	},	
	'encode4Js': function() {
		value_of(StringH.encode4Js("\"")).should_be("\\u0022");
	},	
	'encode4Http': function() {
		value_of(StringH.encode4Http("&")).should_be(encodeURIComponent("&"));
	},	
	'encode4Html': function() {
		value_of(StringH.encode4Html("<")).should_be("&lt;");
	},	
	'encode4HtmlValue': function() {
		value_of(StringH.encode4HtmlValue("<\"")).should_be("&lt;&quot;");
	},	
	'stripTags': function() {
		value_of(StringH.stripTags("a<a>")).should_be("a");
	},	
	'evalJs': function() {
		value_of(StringH.evalJs("return 1+2")).should_be(3);
	},	
	'evalExp': function() {
		value_of(StringH.evalExp("1+2")).should_be(3);
	}
});


})();