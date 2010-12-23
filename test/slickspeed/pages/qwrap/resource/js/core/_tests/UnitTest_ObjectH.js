
(function(){
var ObjectH=QW.ObjectH;
describe('ObjectH', {
	'ObjectH Members': function() {
		value_of('≤‚ ‘FunctionH”µ”–µƒ Ù–‘').log();
	},
	'getType': function() {
		value_of(ObjectH.getType(window)).should_be('window');
		value_of(ObjectH.getType({})).should_be('object');
		value_of(ObjectH.getType('')).should_be('string');
		value_of(ObjectH.getType(new String(''))).should_be('string');
		value_of(ObjectH.getType(document)).should_be('document');
		value_of(ObjectH.getType(document.body)).should_be('BODY');
	},	
	'mix': function() {
		var el={};
		ObjectH.mix(el,{name:'JK'});
		value_of(el.name).should_be('JK');
		ObjectH.mix(el,{name:'Tom'});
		value_of(el.name).should_be('JK');
		ObjectH.mix(el,{name:'Tom'},true);
		value_of(el.name).should_be('Tom');
	},	
	'dump': function(){
		var el={name:'JK',age:100};
		var el2={name:'Tom'};
		var el3=ObjectH.dump(el,['name']);
		value_of(el3.name).should_be('JK');
		value_of(el3.age).should_be(undefined);

		ObjectH.dump(el,['name'],el2);
		value_of(el2.name).should_be('Tom');
		ObjectH.dump(el,['name'],el2,true);
		value_of(el3.name).should_be('JK');
	},
	'keys': function(){
		var el={name:'JK',age:100};
		value_of(ObjectH.keys(el)).property_should_be('length',2);
	},
	'stringify': function(){
		var arr=[1,'hello'];
		value_of(ObjectH.stringify(arr)).property_should_be('length',11);
	},
	'setEx': function(){
		var el={name:'JK',age:100,friend:{}};
		ObjectH.setEx(el,'friend.name','Tom');
		value_of(el.friend.name).should_be('Tom');
	},
	'getEx': function(){
		var el={name:'JK',age:100,friend:{}};
		value_of(ObjectH.getEx(el,'name')).should_be('JK');
	}
});

})();