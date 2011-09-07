module("baidu.dom.query");

test('selector', function() {
	var total = baidu.dom.query('*').length;
	var input_len = baidu.dom.query('input').length;
	var link_len = baidu.dom.query('a').length;

	var input = document.createElement('input');
	input.id = 'test_input';
	input.className = 'test_class_input';
	input.type = 'checkbox';
	input.disabled = true;
	input.style.position = 'absolute';
	input.style.display = 'none';
	input.style.width = '10';
	input = document.body.appendChild(input);
	
	var input1 = document.createElement('input');
	input1.id = 'test_input1';
	input1.className = 'test_class_input1 test_class_input11';
	input1.lang = 'en-US';
	input1 = document.body.appendChild(input1);
	
	var p = document.createElement('p');
	p.id = 'test_p'
	p.className = 'test_class_p'
	p = document.body.appendChild(p);
	
	try{
		var link = document.createElement('<a name="test_name_a">');
	}catch(e){
		var link = document.createElement('a');
		link.name = 'test_name_a';
	}
	
	link.id = 'test_a';
	link.className = 'test_class_a';
	link.href = 'http://www.baidu.com';
	link = p.appendChild(link);
	
	var link1 = document.createElement('a');
	link1.id = 'test#a';
	link1.className = 'test.cla*ss.a'
	link1 = p.appendChild(link1);
	
	var strong = document.createElement('strong');
	strong = link.appendChild(strong);
	
	var span = document.createElement('span');
	span = link.appendChild(span);
	
	var h1 = document.createElement('h1');
	h1 = document.body.appendChild(h1);
	h1.innerHTML = 'hello';
	
	var start_date = new Date();
	
	equals(baidu.dom.query('*').length, total + 8, '*')
	equals(baidu.dom.query('input')[input_len], input, 'div');
	equals(baidu.dom.query('#test_input')[input_len], input, '#title');
	equals(baidu.dom.query('input[id]')[0], input, 'div[class]');
	equals(baidu.dom.query('input[id]')[1], input1, 'div[class]');
	equals(baidu.dom.query('[id=test_input]')[0], input, '[id=title]');
	equals(baidu.dom.query('[name=test_name_a]')[0], link, '[name=asdf]');
	equals(baidu.dom.query('[id=test#a]')[0], link1, '[id=title]');
	equals(baidu.dom.query('[class=test.cla*ss.a]')[0], link1, '[class=fsa]');
	equals(baidu.dom.query('a[name!=test_name_a]')[0], link1, '[name!=asdf]');
	equals(baidu.dom.query('.test_class_input')[0], input, '.note');
	equals(baidu.dom.query('a.test_class_a')[0], link, 'div.example');
	equals(baidu.dom.query('input[class=test_class_input]')[0], input, 'div[class=example]');
	equals(baidu.dom.query('input[class^=test_class][class$=input]')[0], input, 'div[class^=exa][class$=mple]');
	equals(baidu.dom.query('a[class*=*ss]')[0], link1, 'div[class*=mple]');
	equals(baidu.dom.query('input[class~=test_class_input11]')[0], input1, 'div[class~=mple]');
	equals(baidu.dom.query('input[class~=test_class_input11]')[0], input1, 'div[class~=mple]');
	equals(baidu.dom.query('input[lang|=en]')[0], input1, 'input[lang|=en]');
	
	equals(baidu.dom.query('p strong')[0], strong, 'div p');
	equals(baidu.dom.query('p a input').length, 0, 'div p a');
	equals(baidu.dom.query('p > a')[0], link, 'div > p');
	equals(baidu.dom.query('strong + span')[0], span, 'div + p');
	equals(baidu.dom.query('strong ~ span')[0], span, 'div ~ p');
	equals(baidu.dom.query('span ~ strong').length, 0, 'p ~ div');
	equals(baidu.dom.query('a > strong ~ span')[0], span, 'div > p ~ a');
	equals(baidu.dom.query('p,a')[0], p, 'div,p');
	equals(baidu.dom.query('p,a')[1], link, 'div,p');
	equals(baidu.dom.query('a.test_class_a,input.test_class_input')[0], input, 'div.example,p.info');
	equals(baidu.dom.query('a.test_class_a,input.test_class_input')[1], link, 'div.example,p.info');
	equals(baidu.dom.query('[class] #test_a')[0], link, '[class] #title');
	equals(baidu.dom.query('p *[class]')[0], link, 'p *[class]');

	equals(baidu.dom.query('h1:contains(hello)')[0], h1, ':contains(TEXT)');
	equals(baidu.dom.query(':header:last')[0], h1, ':header:last');
	equals(baidu.dom.query('a:disabled').length, 0, 'h1#title');
	equals(baidu.dom.query(':checkbox')[0], input, ':checkbox');
	equals(baidu.dom.query('p:parent')[0], p, ':parent');
	equals(baidu.dom.query('a:nth-child(odd)')[0], link, 'p:nth-child(odd)');
	equals(baidu.dom.query('a:nth-child(even)')[0], link1, 'p:nth-child(even)');
	equals(baidu.dom.query('input:not(#test_input)').length, input_len + 1, 'div:not(.example)');
	equals(baidu.dom.query('input:not(#input)')[input_len], input, 'div:not(.example)');
	equals(baidu.dom.query('a:first-child')[0], link, 'a:first-child');
	equals(baidu.dom.query('a:last-child')[0], link1, 'a:last-child');
	equals(baidu.dom.query('a:only-child').length, 0, 'a:only-child');
	equals(baidu.dom.query('input:empty')[1], input1, 'input:empty');
	equals(baidu.dom.query('p:has(a span)')[0], p, 'div :has(li a)');
	equals(baidu.dom.query('p:has(a span):has(input)').length, 0, 'div :has(li a):has(div)');
	equals(baidu.dom.query('p:has(a span):has(strong)')[0], p, 'div :has(li a):has(div)');
	equals(baidu.dom.query('input:lt(1):eq(1)').length, 0, 'input:lt(1):eq(1)');
	equals(baidu.dom.query('input:lt(1):gt(100)').length, 0, 'input:lt(1):gt(100)');
	equals(baidu.dom.query('input:not(:not(#test_input))')[input_len], input, ':not(:not(div))');
	equals(baidu.dom.query('p:has(:has(span))')[0], p, 'input:has(:has(span))');

	equals(baidu.dom.query('input:odd,a:even')[0], input1, 'input:even,a:odd');
	equals(baidu.dom.query('input:odd,a:even')[1], link, 'input:even,a:odd');
	equals(baidu.dom.query('input:lt(1),a:eq(0)').length, 2, 'input:lt(1),a:eq(0)');
	equals(baidu.dom.query('input:lt(1),a:eq(0)')[0], input, 'input:lt(1),a:eq(0)');
	equals(baidu.dom.query('input:lt(1),a:eq(0)')[1], link, 'input:lt(1),a:eq(0)');
	equals(baidu.dom.query('p:has(a span) strong')[0], strong, 'input:has(a span) strong');
	equals(baidu.dom.query('p:parent a span')[0], span, 'input:parent link span');
	equals(baidu.dom.query('p:parent a strong + span')[0], span, 'input:parent a span + strong');
	equals(baidu.dom.query('input:gt(0),input:eq(0) ~ input')[0], input1, 'input:gt(0),input:eq(0) ~ input');
	equals(baidu.dom.query('p:odd,a:even ~ a')[0], link1, 'input:odd,a:even ~ a');
	equals(baidu.dom.query('input:not(:not(#test_input)) > span').length, 0, ':not(:not(div)) > a');
	equals(baidu.dom.query('p:not(:not(#test_p)) > a')[0], link, ':not(:not(div)) > a');
	equals(baidu.dom.query('p:not(:not(#test_p)) > a')[1], link1, ':not(:not(div)) > a');
	equals(baidu.dom.query('a:not(a.test_class_a,p.test_class_p)')[0], link1, ':not(a.b)');
	equals(baidu.dom.query('a:not(a:nth-child(odd))')[0], link1, ':not(a:b)');
	equals(baidu.dom.query('a:not(a:nth-child(odd) + a)')[0], link, ':not(div + p)');
	equals(baidu.dom.query('a:not(p > a)').length, 0, ':not(div > p)');
	
	if(!ua.browser['ie']){
		equals(baidu.dom.query(':root')[0].tagName.toLowerCase(), 'html', ':root');
		equals(baidu.dom.query('strong:nth-last-child(2) + span')[0], span, 'strong:nth-last-child(2) + span');
		equals(baidu.dom.query('a:link:first-child:nth-child(odd)')[0], link, 'a:link:first-child:nth-child(odd)');
		equals(baidu.dom.query('a:link:first-child:nth-child(odd):last-child').length, 0, 'a:link:first-child:nth-child(odd):lastchild');
		equals(baidu.dom.query('span:only-of-type')[0], span, 'a:only-of-type');
		equals(baidu.dom.query('a:link')[0], link, 'a:link');
		equals(baidu.dom.query('a:visited').length, 0, 'a:visited');
		equals(baidu.dom.query('strong:nth-last-child(2)')[0], strong, 'p:nth-last-child(1)');
		equals(baidu.dom.query('span:nth-last-child(1):nth-child(1)').length, 0 , 'p:nth-last-child(1):nth-child(1)');
		equals(baidu.dom.query('input:nth-of-type(2)')[0], input1, 'p:nth-of-type(1)');
		equals(baidu.dom.query('input:nth-of-type(2):nth-last-of-type(2)').length, 0 , 'p:nth-of-type(2):nth-last-of-type(2)');
	}
	
	var stop_date = new Date();
	ok(true,'Take ' + parseInt(stop_date.getTime()-start_date.getTime()) + ' ms');

	input.parentNode.removeChild(input);
	input1.parentNode.removeChild(input1);
	link.parentNode.removeChild(link);
	h1.parentNode.removeChild(h1);
	p.parentNode.removeChild(p);
});

test('context', function() {
	expect(13);
	
	var p = document.createElement('p');
	p.id = 'test_p';
	p = document.body.appendChild(p);
	
	var link = document.createElement('a');
	link.id = 'test_a';
	link.name = 'test_name_a';
	link.className = 'test_class_a';
	link.href = 'http://www.baidu.com';
	link = p.appendChild(link);
	
	var strong = document.createElement('strong');
	strong = link.appendChild(strong);
	
	var span = document.createElement('span');
	span.id = 'test_span';
	span = link.appendChild(span);
	
	var link1 = document.createElement('a');
	link1.id = 'test_a';
	link1.name = 'test_name_a';
	link1.className = 'test_class_a';
	link1.href = 'http://www.sina.com';
	link1 = document.body.appendChild(link1);
	
	equals(baidu.dom.query('*', p).length, 3, '*')
	equals(baidu.dom.query('a', p).length, 1, 'div');
	equals(baidu.dom.query('#test_a',p).length, 1, '#title');
	equals(baidu.dom.query('#test_a',p)[0], link, '#title');
	equals(baidu.dom.query('.test_class_a', p).length, 1, '.note');
	equals(baidu.dom.query('.test_class_a', p)[0], link, '.note');
	
	equals(baidu.dom.query('#test_a',document).length, 1, '#title');
	equals(baidu.dom.query('#test_a',document.body).length, 1, '#title');
	equals(baidu.dom.query('#test_a',document.body)[0], link, '#title');
	equals(baidu.dom.query('.test_class_a', document).length, 2, '.note');
	equals(baidu.dom.query('.test_class_a', document.body).length, 2, '.note');
	equals(baidu.dom.query('.test_class_a', document.body)[0], link, '.note');
	equals(baidu.dom.query('.test_class_a', document.body)[1], link1, '.note');
	
	p.parentNode.removeChild(p);
	link.parentNode.removeChild(link);
	link1.parentNode.removeChild(link1);
});

test('results', function() {
	var len = baidu.dom.query('*').length;
	var results = [];
	
	baidu.dom.query('*', undefined, results);
	equals(results.length, len, "results");
	for(var i = 0; i < len; i++)
		equals(results[i], baidu.dom.query('*')[i], "results");
	
	var p = document.createElement('p');
	p.id = 'test_p';
	p = document.body.appendChild(p);
	
	var link = document.createElement('a');
	link.id = 'test_a';
	link.name = 'test_name_a';
	link.className = 'test_class_a';
	link.href = 'http://www.baidu.com';
	link = p.appendChild(link);
	
	var strong = document.createElement('strong');
	strong = link.appendChild(strong);
	
	var span = document.createElement('span');
	span.id = 'test_span';
	span = link.appendChild(span);
	
	var link1 = document.createElement('a');
	link1.id = 'test_a';
	link1.name = 'test_name_a';
	link1.className = 'test_class_a';
	link1.href = 'http://www.sina.com';
	link1 = document.body.appendChild(link1);
	
	baidu.dom.query('*', p, results);
	equals(results.length, len + 3, "results");
	equals(results[len], link, "results");
	equals(results[len + 1], strong, "results");
	equals(results[len + 2], span, "results");
	
	p.parentNode.removeChild(p);
	link1.parentNode.removeChild(link1);
});

test('baidu.dom.query.matches', function() {
	var p = document.createElement('p');
	p.id = 'test_p';
	p = document.body.appendChild(p);
	
	var input = document.createElement('input');
	input.id = 'test_input';
	input = p.appendChild(input);
	
	try{
		var link = document.createElement('<a name="test_name_a">');
	}catch(e){
		var link = document.createElement('a');
		link.name = 'test_name_a';
	}
	link.id = 'test_a';
	link.className = 'test_class_a';
	link.href = 'http://www.baidu.com';
	link = p.appendChild(link);
	
	var strong = document.createElement('strong');
	strong = link.appendChild(strong);
	
	var span = document.createElement('span');
	span.id = 'test_span';
	span = link.appendChild(span);
	
	var results = [];
	baidu.dom.query('*', p, results);
	
	var link1 = document.createElement('a');
	link1.id = 'test_a';
	link1.name = 'test_name_a';
	link1.className = 'test_class_a';
	link1.href = 'http://www.sina.com';
	link1 = p.appendChild(link1);
	
	equals(baidu.dom.query.matches('*', results).length, 4, '*')
	equals(baidu.dom.query.matches('a', results).length, 1, 'div');
	equals(baidu.dom.query.matches('a',results)[0], link, 'div');
	equals(baidu.dom.query.matches('#test_a', results).length, 1, '#title');
	equals(baidu.dom.query.matches('#test_a', results)[0], link, '#title');
	equals(baidu.dom.query.matches('[id=test_a]', results).length, 1, '[id=title]');
	equals(baidu.dom.query.matches('[id=test_a]', results)[0], link, '[id=title]');
	if(ua.browser['ie'] != 6){//跟宇祥确认过，此处是IE6的bug，故屏蔽
		equals(baidu.dom.query.matches('[name=test_name_a]', results).length, 1, '[name=asdf]');
		equals(baidu.dom.query.matches('[name=test_name_a]', results)[0], link, '[name=asdf]');	
	}
	equals(baidu.dom.query.matches('p a', results)[0], link, 'div p');
	equals(baidu.dom.query.matches('.test_class_a', results).length, 1, '.note');
	equals(baidu.dom.query.matches('.test_class_a', results)[0], link, '.note');
	equals(baidu.dom.query.matches('input,a', results).length, 2, 'div,p');
	equals(baidu.dom.query.matches('input,a', results)[0], input, 'div,p');
	equals(baidu.dom.query.matches('input,a', results)[1], link, 'div,p');
	equals(baidu.dom.query.matches('p a', results).length, 1, 'div p');
	equals(baidu.dom.query.matches('p a', results)[0], link, 'div p');
	equals(baidu.dom.query.matches('a + span', results).length, 0, 'div + p');
	equals(baidu.dom.query.matches(':empty',results).length, 3, ':empty');
	equals(baidu.dom.query('p:has(a)').length, 1, 'div :has(a)');
	
	p.parentNode.removeChild(p);
});

if(!ua.browser['ie']){
	test('xhtml', function() {
		stop();
		expect(3);
		var iframe = document.createElement('iframe');
		iframe.src = upath + '/query/xhtml_example.xhtml';
		iframe = document.body.appendChild(iframe);

		setTimeout(function(){
			equals(baidu.dom.query(':header',iframe.contentWindow.document).length, 2, ':header');
			equals(baidu.dom.query('input',iframe.contentWindow.document).length, 1, 'input');
			equals(baidu.dom.query('INPUT',iframe.contentWindow.document).length, 1, 'INPUT');
			iframe.parentNode.removeChild(iframe);
			start();
		}, 500)
	});	
}

