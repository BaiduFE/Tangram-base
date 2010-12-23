
(function(){
var FunctionH=QW.FunctionH;
//JK begin-----
describe('FunctionH', {
	'FunctionH Members': function() {
		value_of('≤‚ ‘FunctionH”µ”–µƒ Ù–‘').log();
	},

	'bind': function() {
		var test=function(){
			return this.length;
		};
		value_of(FunctionH.bind(test,'hello')()).should_be(5);
	},	
	'methodize': function() {
		var setName=function(el,name){
			el.name=name;
		};
		var el={};
		el.setName=FunctionH.methodize(setName);
		el.setName('JK');
		value_of(el.name).should_be('JK');
	},	
	'unmethodize': function(){
		var setName=FunctionH.unmethodize(
			function(name){
				this.name=name;
			}
		);
		var el={};
		setName(el,'JK');
		value_of(el.name).should_be('JK');
	},
	'mul': function(){
		var setName=function(el,name){
			el.name=name;
		};
		var setElsName=FunctionH.mul(setName);
		var els=[{},{}];
		setElsName(els,'JK');
		value_of(els[0].name).should_be('JK');
		value_of(els[1].name).should_be('JK');
	},
	'rwrap': function(){
		function Wrap(core){this.core=core};
		var setName = function(el,name){
			el.name=name;
		}
		var setNameRWrap=FunctionH.rwrap(setName,Wrap,0);
		var el={};
		var elw=setNameRWrap(el,'JK');
		value_of(elw.core).should_be(el);	
		value_of(el.name).should_be('JK');	
	},
	'lazyApply': function(){
		value_of(typeof FunctionH.lazyApply).should_be('function');
	}
});

})();