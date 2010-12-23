module('baidu.dom.create')

test('create', function() {
	var div = baidu.dom.create('div');
	equals(div.tagName, 'DIV', 'create a div');
})

test('options', function() {
	var div = baidu.dom.create('div', {
		id : "test",
		style : "height:20px;width:20px;border:solid"
	});
	equals(div.tagName, 'DIV', 'create a div');
	equals(div.id, 'test', 'create a div');
	equals(div.style.height, '20px', 'check style');
	equals(div.style.width, '20px', 'check style');
//	alert(div.style.cssText+'\n'+div.style.border.search(/solid/))
	ok(div.style.cssText.search(/solid/) != -1, 'check border style');
})

test('cover all tag', function() {
	var typeNames = [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
			'ol', 'ul', 'dl', 'div', 'form', 'a', 'table', 'fieldset',
			'address', 'ins', 'del', 'em', 'strong', 'q', 'cite', 'dfn',
			'abbr', 'acronym', 'code', 'samp', 'kbd', 'var', 'img', 'object',
			'hr', 'input', 'button', 'label', 'select', 'iframe' ];
	for ( var i = 0; i < typeNames.length; i++) {
		var o = baidu.dom.create(typeNames[i]);
		equals(o.tagName.toLowerCase(), typeNames[i], 'check tag');
	}
})