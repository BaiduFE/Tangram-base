
(function(){

var DateH=QW.DateH;
describe('DateH', {
	'DateH Members': function() {
		value_of(DateH).should_have_method('format');
	},

	
	'format': function() {
		value_of(DateH.format(new Date("2008/1/1"))).should_be("2008-01-01");
		value_of(DateH.format(new Date("2008/1/12"),"MM/dd/yyyy")).should_be("01/12/2008");
	}
});



})();