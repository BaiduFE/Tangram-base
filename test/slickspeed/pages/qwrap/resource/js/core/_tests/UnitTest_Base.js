
(function(){

describe('QW', {
	'QW Members': function() {
		value_of(QW).should_have_method('provide');
		value_of(QW).should_have_method('getScript');
		value_of(QW).log();
	}
});

})();