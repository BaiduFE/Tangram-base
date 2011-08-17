module("baidu.event.EventArg");
/**
 * stop = preventDefault + stopPropagation
 */
test('stop = preventDefault + stoppropagation', function() {
	expect(3);
	ua.frameExt(function(w) {
		var doc = w.document, div = doc.body.appendChild(doc
				.createElement('div')), div1 = doc.body.appendChild(doc
				.createElement('div')), a = div1.appendChild(doc
				.createElement('a')), nobubbled = true;
		$('div#divf').css('height', 150);
		$('div#divf').css('overflow', 'hidden');
		div.style.height = 2000;
		a.href = '#';
		a.innerHTML = 'ToTop_arg';
		a.target = '_self';
		w.scrollTo(0, doc.body.scrollHeight);
		$(div1).bind('click', function() {
			nobubbled = false;
		});
		$(a).bind('click', function(e) {
			ok(true, '事件派发了');
			(new w.baidu.event.EventArg(e, w)).stop();
		});
		$(a).click();
		var top = w.pageYOffset || doc.documentElement.scrollTop
		        || doc.body.scrollTop || 0;
		ok(top != 0, "默认行为应该被阻止");
		ok(nobubbled, '事件不应该冒泡');
		this.finish();
	});
});