
(function(){
var DomU=QW.DomU;
DomU.ready(function(){window.ready_test_value1=1});
DomU.ready(function(){window.ready_test_value2=2});
describe('DomU', {
	'DomU Members': function() {
		value_of(DomU).log('members');
	},
	'ready': function() {
		value_of(window.ready_test_value1).should_be(1);
		value_of(window.ready_test_value2).should_be(2);
	},
	'create': function() {
		var el=DomU.create('<div id="test4_create">aaa</div>');
		value_of(el.tagName).should_be('DIV');
		value_of(el.innerHTML+'').should_be('aaa');
		var el=DomU.create('');
		value_of(el).should_be(null);
		var frag=DomU.create('<div id="test4_create">aaa</div>',true);
		value_of(frag.nodeType).should_be(11);
	},
	'rectContains': function() {
		var rect1={left:0,top:0,right:100,bottom:100};
		var rect2={left:0,top:0,right:50,bottom:100};
		var rect3={left:0,top:0,right:150,bottom:100};
		value_of(DomU.rectContains(rect1,rect2)).should_be(true);	
		value_of(DomU.rectContains(rect1,rect3)).should_be(false);	
	},

	'rectIntersect': function() {
		var rect1={left:0,top:0,right:100,bottom:100};
		var rect2={left:0,top:0,right:50,bottom:100};
		var rect3={left:200,top:0,width:150,bottom:100};
		value_of(DomU.rectIntersect(rect1,rect2)).property_should_be('left',0);	
		value_of(DomU.rectIntersect(rect1,rect3)).should_be(null);	
	},
	'getDocRect': function() {
		var rect=DomU.getDocRect();
		var rect2={left:0,top:0,right:50,bottom:100};
		var rect3={left:0,top:0,right:150,bottom:100};
		value_of(rect).should_have_property('scrollTop');	
		value_of(rect).log('DocRect');	
	}
});


})();