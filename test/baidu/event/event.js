describe('baidu.event.getKeyCode、getTarget;', {
    'keydown事件中可以获取到键值': function(){
        var inpEl = baidu.dom.g('inp');
        var downCode;
        var target;
        
        baidu.event.on(inpEl, "keydown", function(e){
            e = e || window.event;
            downCode = baidu.event.getKeyCode(e);
            target = baidu.event.getTarget(e);
        });
        
        //按下字符'T'
        uiut.MockEvents.keydown(inpEl, 0x54);
        value_of(downCode).should_be(0x54);
        value_of(target).should_be(inpEl);
    },
    'keypress事件中可以获取到键值': function(){
        var inpEl = baidu.dom.g('inp');
        var pressCode;
        var target;
        
        baidu.event.on(inpEl, "keypress", function(e){
            e = e || window.event;
            pressCode = baidu.event.getKeyCode(e);
            target = baidu.event.getTarget(e);
        });
        
        //按下字符'A'
        uiut.MockEvents.keypress(inpEl, 65);
        value_of(pressCode).should_be(65);
        value_of(target).should_be(inpEl);
    },
    'keyup事件中可以获取到键值': function(){
        var inpEl = baidu.dom.g('inp');
        var upCode;
        var target;
        
        baidu.event.on(inpEl, "keyup", function(e){
            e = e || window.event;
            upCode = baidu.event.getKeyCode(e);
            target = baidu.event.getTarget(e);
        });
        
        //按下字符'B'
        uiut.MockEvents.keyup(inpEl, 66);
		value_of(upCode).should_be(66);
        value_of(target).should_be(inpEl);
    }
});
/*mock event can't fetch the mouse x y
 describe('baidu.event.getPageXY', {
 '获取mousedown事件的鼠标x、y坐标': function(){
 var downX, downY;
 var page = baidu.dom.g('pagexy');
 
 baidu.event.on(page, "click", function(e){
 e = e || window.event;
 downX = baidu.event.getPageX(e);
 downY = baidu.event.getPageY(e);
 alert(downX + "aa" + downY);
 });
 
 uiut.MockEvents.click(page);
 value_of(downX).should_be('200px');
 value_of(downY).should_be('300px');
 alert(downX + "aa" + downY);
 }
 });*/
describe('baidu.event.stopPropagation', {
    '鼠标事件中阻止事件传播': function(){
        var outerVal = 'unchanged';
        var div_inner = baidu.dom.g('inner');
        div_outer = baidu.dom.g('outer');
        div_inner.onclick = function(e){
            e = e || window.event;
            baidu.event.stopPropagation(e);
        };
        div_outer.onclick = function(e){
            e = e || window.event;
            outerVal = 'changed';
        };
        uiut.MockEvents.click(div_inner);
        value_of(outerVal).should_be("unchanged");
    },
    '键盘事件中阻止事件传播': function(){
        var keyVal = 'innerkey';
        var div_inner = baidu.dom.g('input_stopP');
        div_outer = baidu.dom.g('outer');
        div_inner.onkeydown = function(e){
            e = e || window.event;
            baidu.event.stopPropagation(e);
        };
        div_outer.onkeydown = function(e){
            e = e || window.event;
            keyVal = 'outerkey';
        };
        //type key 'B'
        uiut.MockEvents.keydown(div_inner, 66);
        value_of(keyVal).should_be("innerkey");
    }
});
describe('baidu.event.preventDefault', {
    'submit事件中阻止事件的默认行为,没有submit到action.html即为pass': function(){
		//没有submit到action.html即为pass
		var submit_prevent = baidu.dom.g('sub_prevent');
        submit_prevent.onclick = function(e){
            e = e || window.event;
            baidu.event.preventDefault(e);
        };
		uiut.MockEvents.click(submit_prevent);
		value_of(true).should_be_true();
    }
});
