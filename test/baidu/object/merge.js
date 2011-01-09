module('baidu.object.merge');

test('基础测试', function() {
	var oSrc = {id: 777, method: 'post', 'key': 'value'};
	var oTarget = {id: 888};

	baidu.object.merge(oTarget, oSrc);
	same(
        oTarget,
        {id: 888, 'method': 'post', 'key': 'value'},
        '默认三个属性'
    );

	var oSrc = {id: 777, method: 'post', 'key': 'value'};
	var oTarget = {id: 888};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'overwrite' : true
        }
    );
	same(oTarget, {id: 777, 'method': 'post', 'key': 'value'}, '强制覆盖');

	var oSrc = {id: 777, method: 'post', 'key': 'value'};
	var oTarget = {id: 888};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'whiteList' : ['id', 'method']
        }
    );
	same(oTarget, {id: 888, 'method': 'post'}, '指定白名单');

	var oSrc = {id: 777, method: 'post', obj: {a: 1, b: 2}};
	var oTarget = {id: 888, obj: {b: 3, c: 3}};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'recursive' : true
        }
    );
	same(oTarget, {id: 888, 'method': 'post', obj: {a: 1, b: 3, c: 3}}, '递归');

	var oSrc = {id: 777, method: 'post', obj: {a: 1, b: 2}};
	var oTarget = {id: 888, obj: {b: 3, c: 3}};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'whiteList' : ['method', 'obj'],
            'recursive' : true
        }
    );
	same(oTarget, {id: 888, 'method': 'post', obj: {a: 1, b: 3, c: 3}}, '递归+白名单');

	var oSrc = {id: 777, method: 'post', obj: {a: 1, b: 2}};
	var oTarget = {id: 888, obj: {b: 3, c: 3}};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'overwrite' : true,
            'recursive' : true
        }
    );
	same(oTarget, {id: 777, 'method': 'post', obj: {a: 1, b: 2, c: 3}}, '递归+覆盖');

	var oSrc = {id: 777, method: 'post', obj: {a: 1, b: 2}};
	var oTarget = {id: 888, obj: {b: 3, c: 3}};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'overwrite' : true,
            'whiteList' : ['method', 'obj']
        }
    );
	same(oTarget, {id: 888, 'method': 'post', obj: {a: 1, b: 2}}, '白名单+覆盖，不递归');

	var oSrc = {id: 777, method: 'post', obj: {a: 1, b: 2}};
	var oTarget = {id: 888, obj: {b: 3, c: 3}};
	baidu.object.merge(
        oTarget,
        oSrc,
        {
            'recursive' : true,
            'overwrite' : true,
            'whiteList' : ['method', 'obj']
        }
    );
	same(oTarget, {id: 888, 'method': 'post', obj: {a: 1, b: 2, c: 3}}, '白名单+覆盖，递归');
});
