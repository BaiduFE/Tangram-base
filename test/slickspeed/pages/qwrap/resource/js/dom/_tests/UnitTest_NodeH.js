
(function(){
var DomU=QW.DomU,NodeH=QW.NodeH,EventTargetH=QW.EventTargetH;
DomU.ready(function(){
	window.testDiv=document.body.appendChild(DomU.create('<div id="div_4_NodeH_test" class="div_4_test" style="background-color:gray;z-index:100;width:200px;position:absolute;">div_4_NodeH_test</div>'));
});

describe('NodeH', {
	'NodeH Members': function() {
		value_of(NodeH).log('members');
	},
	'$': function() {
		function Wrap(core){this.core=core};
		value_of(NodeH.$('div_4_NodeH_test')==testDiv).should_be(true).line;
		value_of(NodeH.$(testDiv).id).should_be('div_4_NodeH_test').line;
		value_of(NodeH.$('div_4_NodeH_test_xxx')).should_be(null).line;
		value_of(NodeH.$(new Wrap(testDiv)).id).should_be('div_4_NodeH_test').line;
	},
	'query': function() {
		value_of(NodeH.query(0,'body').length).should_be(1);
		value_of(NodeH.query(document.body,'body').length).should_be(0);
		value_of(NodeH.query(0,'#div_4_NodeH_test')[0] == testDiv).should_be(true);
		try{
			var el=NodeH.query('id_not_exist','div');
		}
		catch(ex){
			el='error';
		}
		value_of(el).should_be('error');
	},
	'getElementsByClass/hasClass/addClass/removeClass/replaceClass': function() {
		var el=NodeH.getElementsByClass(0,'div_4_test')[0];
		value_of(el==testDiv).should_be(true).line;
		value_of(NodeH.hasClass(el,'div_4_test_new')).should_be(false).line;
		NodeH.addClass(el,'div_4_test_new');
		value_of(NodeH.hasClass(el,'div_4_test_new')).should_be(true).line;
		NodeH.removeClass(el,'div_4_test_new');
		value_of(NodeH.hasClass(el,'div_4_test_new')).should_be(false).line;
		NodeH.addClass(el,'div_4_test_new');
		NodeH.replaceClass(el,'div_4_test_new','div_4_test_new2');
		value_of(NodeH.hasClass(el,'div_4_test_new')).should_be(false).line;
		value_of(NodeH.hasClass(el,'div_4_test_new2')).should_be(true).line;
	},
	'getElementsByTagName': function() {
		value_of(NodeH.getElementsByTagName(0,'Body')[0]==document.body).should_be(true).line;
	},
	'on/un/fire': function() {
		var el=DomU.create('<div onclick="window._click_test_1=1;"></div>');
		document.body.appendChild(el);
		EventTargetH.on(el,'click',function(){window._click_test_2=2;});
		EventTargetH.on(el,'click',function(){window._click_test_3=3;});
		var fun4=function(){
			window._click_test_4=4;
			value_of(this==el).should_be(true).line;
		};
		EventTargetH.on(el,'click',fun4);
		var fun5=function(){window._click_test_5=5};
		EventTargetH.on(el,'click',fun5);
		EventTargetH.un(el,'click',fun5);
		EventTargetH.fire(el,'click');
		value_of(window._click_test_1).should_be(1).line;
		value_of(window._click_test_2).should_be(2).line;
		value_of(window._click_test_3).should_be(3).line;
		value_of(window._click_test_4).should_be(4).line;
		value_of(window._click_test_5).should_be(undefined).line;
		document.body.removeChild(el);
	},
	'nextSibling/previousSibling/ancestorNode/firstChild': function() {
		var el=DomU.create('<div><span>1</span>2<strong id="strong_4_test">3</strong><input value=4 /></div>');
		document.body.appendChild(el);
		var subStrongEl=NodeH.$('strong_4_test');
		value_of(NodeH.nextSibling(subStrongEl,"div")).should_be(null).line;
		value_of(NodeH.nextSibling(subStrongEl,"input").value).should_be('4').line;
		value_of(NodeH.previousSibling(subStrongEl).nodeType).should_be(3).line;
		value_of(NodeH.previousSibling(subStrongEl,"span").tagName).should_be('SPAN').line;
		value_of(NodeH.ancestorNode(subStrongEl,"body").tagName).should_be('BODY').line;
		value_of(NodeH.ancestorNode(subStrongEl,"ul")).should_be(null).line;
		value_of(NodeH.firstChild(el).tagName).should_be('SPAN').line;
		value_of(NodeH.firstChild(el,'strong')==subStrongEl).should_be(true).line;
		document.body.removeChild(el);
	},
	'contains': function() {
		var el=DomU.create('<div><span>1</span>2<strong id="strong_4_test">3</strong><input value=4 /></div>');
		document.body.appendChild(el);
		var subStrongEl=NodeH.$('strong_4_test');
		value_of(NodeH.contains(el,subStrongEl)).should_be(true).line;
		value_of(NodeH.contains(el,el)).should_be(false).line;
		value_of(NodeH.contains(el,document.body)).should_be(false).line;
		document.body.removeChild(el);
	},
	'appendChild/removeChild/removeNode/cloneNode/setAttr/getAttr': function() {
		var el=DomU.create('<div><span>1</span>2<strong id="strong_4_test">3</strong><input value=4 /></div>');
		document.body.appendChild(el);
		NodeH.setAttr(el,'enName','Tom');
		value_of(NodeH.getAttr(el,'enName')).should_be('Tom');
		NodeH.removeChild(el,el.firstChild);
		NodeH.removeChild(el,el.firstChild);
		value_of(el.firstChild.tagName).should_be('STRONG');
		NodeH.removeNode(el,true);
		var subStrongEl=NodeH.$('strong_4_test');
		value_of(subStrongEl).should_be(null);
	},
	'show/hide': function() {
		NodeH.hide(testDiv);
		value_of(testDiv.offsetWidth).should_be(0);
		NodeH.show(testDiv);
		value_of(testDiv.offsetWidth).should('>',10);
	},
	'getStyle/setStyle/getCurrentStyle': function() {
		var el=DomU.create('<div style="color:red"><strong id="strong_4_test" style="font-size:15px;">3</strong></div>');
		document.body.appendChild(el);
		var strongEl=el.firstChild;
		NodeH.setStyle(strongEl,'fontSize','12px');
		value_of(NodeH.getStyle(strongEl,'fontSize')).should_be('12px');
		value_of(NodeH.getStyle(strongEl,'color')).should_be(null);
		value_of(NodeH.getCurrentStyle(strongEl,'color')).should_not_be(null);
		document.body.removeChild(el);
	},
	'insertAdjacentHTML/insertAdjacentElement': function() {
		var html='<div id="jktest">aaa</div>';
		NodeH.insertAdjacentHTML(document.body,'afterBegin',html);
		el=document.body.firstChild;
		value_of(el.id).should_be('jktest');
		document.body.removeChild(el);
	},
	'getXY/.../setCenter': function() {
		value_of('Testcases to be done').log();
	}

});


})();