
(function(){
var ClassH=QW.ClassH;
describe('ClassH', {
	'ClassH Members': function() {
		value_of(ClassH).log();
	},
	'extends': function(){
		var Point = function(x){
			this.x = x;
		}
		Point.prototype.dimension = 1;

		var Point2D = ClassH.extend(function(x,y){
			this.y = y;
		},Point);
		Point2D.prototype.dimension = 2;
	

		var Point3D = QW.ClassH.extend(function(x,y,z){
			this.z = z;
		},Point2D);
		Point3D.prototype.dimension = 3;		
		
		var p = new Point(1);
		value_of(p).log();

		var p2 = new Point2D(2,3);
		value_of(p2 instanceof Point).should_be(true);
		value_of(p2 instanceof Point2D).should_be(true);
		value_of(p2).log();

		var p3 = new Point3D(3,4,5);
		value_of(p3).log();
	}
});

})();