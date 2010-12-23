module('baidu.element.extend');

test('封装扩展 - function', function() {
	stop();
	ua.importsrc('baidu.dom.query,baidu.dom.g', function(){
		var p = document.body.appendChild(document.createElement('div'));
		p.className = 'berg';
		baidu.element.extend( {
			"myFn" : function(element, id) {
			    element.id = id;
			    equals(baidu.lang.isArray(this._dom),true,'check this ');//测试this是否指向的baidu.e()
			}
		});
		baidu.e(baidu.dom.query(".berg")).myFn("abc");
		equals(baidu.g('abc').id, 'abc', 'check function success');
		start();
	}, 'baidu.dom.g', 'baidu.element.extend');
});
