module("baidu.page.getViewWidth");

test("无滚动条", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200).css('height', 200);
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
//			setTimeout(function(){
				equals(w.baidu.page.getViewWidth(), 200);
				op.finish();				
//			}, 2000);
		}
	});
});

// code was from http://www.alexandre-gomes.com/?p=115
function getScrollBarWidth() {  
  var inner = document.createElement('p');  
  inner.style.width = "100%";  
  inner.style.height = "200px";  

  var outer = document.createElement('div');  
  outer.style.position = "absolute";  
  outer.style.top = "0px";  
  outer.style.left = "0px";  
  outer.style.visibility = "hidden";  
  outer.style.width = "200px";  
  outer.style.height = "150px";  
  outer.style.overflow = "hidden";  
  outer.appendChild (inner);  

  document.body.appendChild (outer);  
  var w1 = inner.offsetWidth;  
  outer.style.overflow = 'scroll';  
  var w2 = inner.offsetWidth;  
  if (w1 == w2) w2 = outer.clientWidth;  

  document.body.removeChild (outer);  

  return (w1 - w2);  
};

test("有滚动条", function() {
	ua.frameExt( {
		onafterstart : function(f) {
			$(f).css('width', 200).css('height', 200);
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
			w.$(w.document.body).append('<div id="test1"></div>');
			w.$('div#test1').css('width', 600).css('height', 600);
      equals(w.baidu.page.getViewWidth(), ua.browser.ie == 8 ? 184 : 200 - getScrollBarWidth());
			op.finish();
		}
	});
});
