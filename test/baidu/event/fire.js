/**
 * 用例在所有浏览器上均能正确fire event的情况下，可以认为完成了所有功能的覆盖
 */
module('baidu.event.fire');

(function() {
	/**
	 * 校验事件触发
	 */
	var check = function(op) {
		var op = typeof op == 'string' ? {
			eName : op
		} : op, eName = op.eName.indexOf('on') == 0 ? op.eName
				: 'on' + op.eName, obj = op.obj
				|| document.body.appendChild(document.createElement('div')), options = op.options || {};
		obj[eName] = function(event) {
			ok(true, 'event fired : ' + eName);
			if (op.callback) {
				op.callback(event);
			}
		};
		if (op.options)
			baidu.event.fire(obj, eName, op.options);
		else{
			baidu.event.fire(obj, eName);
		}
			
	};
	
	var checkIE = function(op) {
		var op = typeof op == 'string' ? {
			eName : op
		} : op, eName = op.eName.indexOf('on') == 0 ? op.eName
				: 'on' + op.eName, obj = op.obj
				|| document.body.appendChild(document.createElement('div')), options = op.options || {};
		if(eName=='onabort'||eName=='onerror'){
			var div = document.createElement('div');
			var img = document.createElement('img');
			document.body.appendChild(div);
			div.appendChild(img);
			obj = img;
		}
		else if(eName=='onchange'){
			var div = document.createElement('div');
			var select = document.createElement('select');
			document.body.appendChild(div);
			div.appendChild(select);
			obj = select;
		}
//		else if(eName=='onerror'){
//			obj = window;
//		}
		else if(eName=='onsubmit'||eName=='onreset'){
			var form = document.createElement('form');
			document.body.appendChild(form);
			obj = form;
		}
		else if(eName=='onselect'){
			var div = document.createElement('div');
			var input = document.createElement('input');
			document.body.appendChild(div);
			div.appendChild(input);
			obj = input;
		}
		obj[eName] = function(event) {
			ok(true, 'event fired : ' + eName);
			if (op.callback) {
				op.callback(event);
			}
		};
		if (op.options)
			baidu.event.fire(obj, eName, op.options);
		else{
			baidu.event.fire(obj, eName);
		}
			
	};

	/**
	 * fire event on dom
	 */
	test('on dom', function() {
		var eList = [ 'keydown', 'keyup', 'keypress', 'click', 'dblclick',
				'mousedown', 'mouseup', 'mouseover', 'mouseout' ];
		var hList = [ 'abort', 'blur', 'change', 'focus', 'error','load','reset', 'select',
				 'scroll', 'submit' ];
		var wList = [ 'scroll', 'resize', 'reset', 'submit', 'change',
				'select', 'error', 'abort', 'unload' ];//opera下，只有scroll、resize、error、unload能派发
		for ( var e in eList) {
			check(eList[e]);
		}

		if (ua.browser.ie == 0) {
			for ( var e in hList) {
				check( {
					eName : hList[e],
					obj : document
				});
			}
			for ( var e in wList) {
				check( {
					eName : wList[e],
					obj : window
				});
			}
			expect(eList.length + hList.length + wList.length + (ua.browser.opera < 9 ? -5 : 0));
		} else{
			for ( var e in hList) {
				if(hList[e]!='load'&&hList[e]!='unload'){
					checkIE( {
						eName : hList[e]
					});
				}
			}
			for ( var e in wList) {
				if(wList[e]!='load'&&wList[e]!='unload'){
					checkIE( {
						eName : wList[e]
					});
				}
			}
			expect(eList.length+ (hList.length-1) + (wList.length-1));
		}
	});

	/**
	 * keyboard event options
	 */
	test('options of keyboard', function() {
		if(ua.browser.ie || ua.browser.ff)
		check( {
			eName : 'keypress',
			callback : function(e) {
				e = e || window.event;
				var keycode = e.which || e.keyCode;
				equals(keycode, this.options.keyCode);
			},
			options : {
				keyCode : 64
			}
		});
	});
	
	test('options.relatedTarget', function() {
		var div = document.body.appendChild(document.createElement('div'));
		$(div).css('width', 50).css('height', 50).css('background-color', 'red');
		var div1 = document.body.appendChild(document.createElement('div'));
		$(div1).css('width', 50).css('height', 50).css('background-color','blue');
		var options = {
			relatedTarget : div1,
			callback : function() {
                ok(true,"from div move to div1");
			}	
		};
		baidu.event.fire(div, "mouseout",options);

	});
	
})();