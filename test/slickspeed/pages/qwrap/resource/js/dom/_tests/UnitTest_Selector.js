
(function(){
var Selector=QW.Selector
describe('Selector', {
	'Selector Members': function() {
		value_of(Selector).log('members');
	},
	'selector2Filter': function() {
		var fun=Selector.selector2Filter('body');
		value_of(fun).log('filter function:');
		value_of(typeof fun).should_be('function');
	},
	'test': function() {
		var fun=Selector.selector2Filter('body');
		value_of(Selector.test(document.body,'body')).should_be(true);
		value_of(Selector.test(document.body,'div')).should_be(false);
	},
	'query': function() {
		var fun=Selector.query(0,'body');
		value_of(Selector.query(0,'body')[0]==document.body).should_be(true);
		value_of(Selector.query(document.body,'body').length).should_be(0);
	}
});


})();