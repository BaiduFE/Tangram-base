module("baidu.dom.remove");

test(
		"删除所有已有标签的遍历",
		function() {
			ua
					.frameExt(function(w) {
						var typeNames = ('p,h1,h2,h3,h4,h5,h6,blockquote,ol,ul,dl,div,form,a' + ',table,fieldset,address,ins,del,em,strong,q,cite,dfn,abbr' + ',acronym,code,samp,kbd,var,img,object,hr' + ',input,button,label,select,iframe')
								.split(',');
						for ( var i = 0; i < typeNames.length; i++) {
							var cnt = w.document.body.childNodes.length;
							var tag = typeNames[i];
							var ele = w.document.createElement(tag);
							ele.id = "test_" + tag;
							w.document.body.appendChild(ele);
							w.baidu.dom.remove("test_" + tag);
							equals(cnt, w.document.body.childNodes.length,
									'check if node is removed : ' + tag);
						}

						this.finish();
					});
		});

test('text node', function() {
	var div = document.body.appendChild(document.createElement("div"));
	var node = div.appendChild(document.createTextNode("test"));
	baidu.dom.remove(node);
	equals(div.innerHTML, '', 'text node is removed');
	baidu.dom.remove(div);
});

test('异常用例', function() {
	expect(1);
	var div = document.createElement('div');
	div.id = 'remove_test_div';
	// alert(div && div.nodeName && (div.nodeType == 1 || id.nodeType == 9))
		try {
			baidu.dom.remove("remove_test_div");

		} catch (e) {
			ok(true, 'exception catched');
		}
	})