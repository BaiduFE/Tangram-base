
(function(){
var ArrayH=QW.ArrayH;
//JK begin-----
describe('ArrayH', {
	'ArrayH Members': function() {
		value_of("²âÊÔArrayÓµÓÐµÄÊôÐÔ").log();
		value_of(ArrayH).should_have_method('map');
		value_of(ArrayH).should_have_method('forEach');
		value_of(ArrayH).should_have_method('filter');
	},

	'map': function() {
		value_of(ArrayH.map([1,2,3],
			function(o,i,arr){
				return o*5;
			}
		)[1]).should_be(10);
	},	
	'forEach': function() {
		ArrayH.forEach([1,2,3],
			function(o,i,arr){
				value_of(o).log("item");
				value_of(i).log("index");
				value_of(arr).log("array");
			}
		);
	},	
	'forEach Add': function(){
		var arr = [1,2,3];
		var t = 0;
		ArrayH.forEach(arr,
			function(o,i,arr){
				arr.push(i);
				value_of(arr.slice(0)).log("array");
				t++;
			}
		);	
		value_of(t).should_be(3);
	},
	'forEach Del': function(){
		var arr = [1,2,3];
		var t = 0;
		ArrayH.forEach(arr,
			function(o,i,arr){
				arr.pop();
				value_of(arr.slice(0)).log("array");
				t++;
			}
		);	
		value_of(t).should_be(2);
	},
	'forEach undefined': function(){
		var arr = [1,null,,4];
		var t = 0;

		ArrayH.forEach(arr,
			function(){
				t++;
			}
		);
		value_of(t).should_be(3);	
	},
	'forEach arguments': function(){
		function t(){
			ArrayH.forEach(arguments, function(o,i,a){value_of(a).log()});
		}
		t(1,undefined,3);
	},
	

	'filter': function(){
		var arr=ArrayH.filter([-2,-1,0,1,2], function(o,i,a){return o>0});
		value_of(arr.length).should_be(2);
	},
	
	'some': function(){
		var arr=[-2,-1,0,1,2];
		value_of(ArrayH.some(arr, function(o,i,a){return o>0})).should_be(true);
		value_of(ArrayH.some(arr, function(o,i,a){return o>2})).should_be(false);
	},
	
	'every': function(){
		var arr=[-2,-1,0,1,2];
		value_of(ArrayH.every(arr, function(o,i,a){return o>-3})).should_be(true);
		value_of(ArrayH.every(arr, function(o,i,a){return o>0})).should_be(false);
	},
	
	'indexOf': function(){
		var arr=[-2,-1,0,1,2,0];
		value_of(ArrayH.indexOf(arr, 3)).should_be(-1);
		value_of(ArrayH.indexOf(arr, 0)).should_be(2);
		value_of(ArrayH.indexOf(arr,0,3)).should_be(5);
		value_of(ArrayH.indexOf(arr,0,-2)).should_be(5);
	},
	
	'lastIndexOf': function(){
		var arr=[-2,-1,0,1,2,0];
		value_of(ArrayH.lastIndexOf(arr, 3)).should_be(-1);
		value_of(ArrayH.lastIndexOf(arr, 0)).should_be(5);
		value_of(ArrayH.lastIndexOf(arr,0,1)).should_be(-1);
		value_of(ArrayH.lastIndexOf(arr,0,2)).should_be(2);
		value_of(ArrayH.lastIndexOf(arr,0,-2)).should_be(2);
	},
	
	'contains': function(){
		var arr=[-2,-1,0,1,2,0];
		value_of(ArrayH.contains(arr, 0)).should_be(true);
		value_of(ArrayH.contains(arr, 3)).should_be(false);
	},
	
	'clear': function(){
		var arr=[-2,-1,0,1,2,0];
		ArrayH.clear(arr)
		value_of(arr.length).should_be(0);
	},
	
	
	'remove': function(){
		var arr=[-2,-1,0,1,2,0];
		value_of(ArrayH.remove(arr, 3)).should_be(-1);
		value_of(ArrayH.remove(arr, 0)).should_be(2);
		value_of(ArrayH.remove(arr, 0)).should_be(-1);
	},
	
	'unique': function(){
		var arr=[-2,-1,0,1,2,0];
		value_of(ArrayH.unique(arr, 3).length).should_be(5);
	},

	'reduce': function(){
		var arr=[-2,-1,0,1,2,3];
		value_of(ArrayH.reduce(arr, function(a,b){value_of([a,b]).log();return a+b;})).should_be(3);
		value_of(ArrayH.reduce(arr, function(a,b){return a+b;},5)).should_be(8);
	},
	
	'reduceRight': function(){
		var arr=[1,2,3];
		value_of(ArrayH.reduceRight(arr, function(a,b){return a/b;})).should_be(1.5);
		value_of(ArrayH.reduceRight(arr, function(a,b){return a/b;},6)).should_be(1);
	},

	'toArray': function() {
		var arr=[1,2];
		value_of(
			ArrayH.toArray(arr).length
		).should_be(2);
	}

});

})();