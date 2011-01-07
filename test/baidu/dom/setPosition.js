module('baidu.dom.setPosition');

test('基础用例', function() {

    var div = document.createElement('div');

    document.body.appendChild(div);
    div.style.position = 'absolute';
    div.style.marginLeft = '200px';
    div.style.marginTop = '200px'; 

    baidu.dom.setPosition(div, {
        top : 100,
        left : 100
    });

    equal(baidu.dom.getStyle(div, "left"), '-100px', "应该减去margin-left的偏移");
    equal(baidu.dom.getStyle(div, "top"), '-100px', "应该减去margin-top的偏移");
});

test('not set marginLeft value', function() {

    var div = document.createElement('div');

    document.body.appendChild(div);
    div.style.position = 'absolute';

    baidu.dom.setPosition(div, {
        top : 100,
        left : 100
    });

    equal(baidu.dom.getStyle(div, "left"), '-100px', "应该减去margin-left的偏移");
    equal(baidu.dom.getStyle(div, "top"), '-100px', "应该减去margin-top的偏移");
});
