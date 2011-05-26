module("baidu.dom.fixable");

test("不存在元素ID", function() {
	expect(1);
	var fix = baidu.dom.fixable("notExistDiv", {});
	equal(undefined, fix, "不存在的元素返回undefined");
});
//
test("存在元素，设定left，top各20 options无参 render", function() {
	ua.frameExt({
		onafterstart : function(f) {
			$(f).css('width', 300).css('height', 300);
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
			w.$(w.document.body).append('<div id="test1"></div>');
			w.$('div#test1').css('width', 600).css('height', 600);
			var div = w.document.createElement('div');
			$(div).attr("id", "id01");
			$(div).css('position', 'absolute').css('left', '20').css('top', '20')
			.css('backgroundColor', 'red').css('width', '100px').css('height', '100px');
			w.$(w.document.body).append(div);
			// options 无参数
			var options = {};
			var left = w.baidu.dom.getPosition(div).left;
			var top = w.baidu.dom.getPosition(div).top;
			// 构造一个fixable对象
			var fix = w.baidu.dom.fixable(div, options);
			// 将当前win对象滚动至右下角
			w.scrollTo(100, 100);
			// 校验fixable
			ok(w.baidu.dom.getPosition(div).left === left + 100, '原位置,left:'
					+ left + ' 当前div对象位置移动,left:'
					+ w.baidu.dom.getPosition(div).left);
			ok(w.baidu.dom.getPosition(div).top === top + 100, '原位置,top:'
					+ top + ' 当前div对象位置移动,top:'
					+ w.baidu.dom.getPosition(div).top);
			// fixable 释放
			fix.release();
			// fixable渲染对象位置还原
			equal(w.baidu.dom.getPosition(div).left, left, "在release后，位置还原left");
			equal(w.baidu.dom.getPosition(div).top, top, "在release后，位置还原top");
			w.scrollTo(0, 0);
			equal(w.baidu.dom.getPosition(div).left, left, "在release后，位置还原left");
			equal(w.baidu.dom.getPosition(div).top, top, "在release后，位置还原top");
			op.finish();
		}
	});
});
//
test("存在元素原始left300、top300，options设定right、bottom各20 render", function() {
	ua.frameExt({
		onafterstart : function(f) {
			$(f).css('width', 300).css('height', 300);
		},
		ontest : function(w, f) {
			var op = this;
			var origleft = 300;
			var origtop = 300;
			w.$(w.document.body).css('border', 0);
			w.$(w.document.body).append('<div id="test1"></div>');
			w.$('div#test1').css('width', 600).css('height', 600);
			var div = w.document.createElement('div');
			$(div).attr("id", "id01");
			$(div).css('position', 'absolute').css('left', origleft).css('top', origtop)
				.css('backgroundColor', 'red').css('width', '100px').css('height', '100px');
			w.$(w.document.body).append(div);
			var options = {
				vertival : "bottom",
				horizontal : "right",
				offset : {x : 20, y : 20}
			};
			options.onrender = function() {
				ok(true, " do on render method success");
			};
			options.onrelease = function() {
				ok(true, " do on release method success");
			};
			// 构造一个fixable对象
			var fix = w.baidu.dom.fixable(div, options);
			var left = w.baidu.dom.getPosition(div).left;
			var top = w.baidu.dom.getPosition(div).top;
			var right = w.baidu.page.getViewWidth() - w.baidu.dom.getPosition(div).left - 100;
			var bottom = w.baidu.page.getViewHeight() - w.baidu.dom.getPosition(div).top - 100;
			ok(right === 20, "options设定初始坐标 20 ,right:" + right);
			ok(bottom === 20, "options设定初始坐标20 ,bottom:" + bottom);
			// 将当前win对象滚动至右下角
			w.scrollTo(100, 100);
			// 校验fixable
			ok(w.baidu.dom.getPosition(div).left === left + 100, '原位置,left:'
					+ left + ' 当前div对象位置移动,left:' + w.baidu.dom.getPosition(div).left);
			ok(w.baidu.dom.getPosition(div).top === top + 100, '原位置,top:'
					+ top + ' 当前div对象位置移动,top:' + w.baidu.dom.getPosition(div).top);
			// fixable 释放
			fix.release();
			// fixable渲染对象位置还原
			equal(w.baidu.dom.getPosition(div).left, origleft,
					"在release后，位置还原left");
			equal(w.baidu.dom.getPosition(div).top, origtop,
					"在release后，位置还原top");
			w.scrollTo(0, 0);
			op.finish();
		}
	});
});
// onupdate方法会在update方法执行之后调用，已与lxp确认
test("UPDATE方法验证，div对象位置验证", function() {
	expect(15);
	ua.frameExt({
		onafterstart : function(f) {
			$(f).css('width', 300).css('height', 300);
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
			w.$(w.document.body).append('<div id="test1"></div>');
			w.$('div#test1').css('width', 600).css('height', 600);
			var div = w.document.createElement('div');
			$(div).attr("id", "id01");
			$(div).css('position', 'absolute').css('left', '20').css('top', '20')
			.css('backgroundColor', 'red').css('width', '100px').css('height', '100px');
			w.$(w.document.body).append(div);
			var options = {
					vertival : "top",
					horizontal : "left",
					offset : {x : 100, y : 100}
				};
			options.onrender = function() {
				ok(true, "更新后onrender方法调用成功");
			};
			options.onrelease = function() {
				ok(true, " 更新后onrelease方法调用成功");
			};
			options.onupdate = function() {
				ok(true, " 更新后onupdate方法调用成功");
			};

			
			// 构造一个fixable对象 1
			var fix = w.baidu.dom.fixable(div, {
				onupdate : function() {
					ok(true, "初始化onupdate调用成功");
				},
				onrender : function() {
					ok(true, "初始化onrender调用成功");
				},
				onrelease : function() {
					ok(true , "初始化onrelease调用成功");
				}
			});
			// 34 
			ok(w.baidu.dom.getPosition(div).left === 20 , "初始化，位置 left:20");
			ok(w.baidu.dom.getPosition(div).top === 20 , "初始化，位置 top:20");
			//无作用，当创建后自动调用
			fix.render(); 
			// fixable对象渲染 2
			fix.release(); 
			//无作用，无法校验
			fix.release();
			// 5
			fix.update(options);
			// 6
			fix.render();
			// 78
			var left = w.baidu.dom.getPosition(div).left;
			var top = w.baidu.dom.getPosition(div).top;
			ok(left === 100 , "更新后滚动前，位置 left:100");
			ok(top === 100 , "更新后滚动前，位置 top:100");
			// 将当前win对象滚动至右下角
			w.scrollTo(100, 100);
			// 校验fixable 9 10
			ok(w.baidu.dom.getPosition(div).left === left + 100, '原位置,left:'
					+ left + ' 当前div对象位置移动,left:'
					+ w.baidu.dom.getPosition(div).left);
			ok(w.baidu.dom.getPosition(div).top === top + 100, '原位置,top:'
					+ top + ' 当前div对象位置移动,top:'
					+ w.baidu.dom.getPosition(div).top);
			w.scrollTo(0, 0);
			// fixable渲染对象位置还原  11 12
			equal(w.baidu.dom.getPosition(div).left, left, "在release前，位置还原left");
			equal(w.baidu.dom.getPosition(div).top, top, "在release前，位置还原top");
			// fixable 释放 13
			fix.release();
			equal(w.baidu.dom.getPosition(div).left, 20, "在release后，位置还原div原始位置,left");
			equal(w.baidu.dom.getPosition(div).top, 20, "在release后，位置还原div原始位置,top");
			//fixable 装饰对象还原原始位置
			
			op.finish();
		}
	});
});
// 基于w3标准 切掉部分无法验证
test("当超出fix内容超出父页面，超出部分clip掉",function() {
	ua.frameExt({
		onafterstart : function(f) {
			$(f).css('width', 300).css('height', 300);
		},
		ontest : function(w, f) {
			var op = this;
			w.$(w.document.body).css('border', 0);
			w.$(w.document.body).append('<div id="test1"></div>');
			w.$('div#test1').css('width', 600).css('height', 600);
			var div = w.document.createElement('div');
			$(div).attr("id", "id01");
			$(div).css('position', 'absolute').css('left', '20').css('top', '20')
			.css('backgroundColor', 'red').css('width', '100px').css('height', '100px');
			w.$(w.document.body).append(div);
			var options = {
					vertival : "top",
					horizontal : "left",
					offset : {x : 1000, y : 1000}
				};
			options.onrender = function() {
				ok(true, "onrender方法调用成功");
			};
			options.onrelease = function() {
				ok(true, "onrelease方法调用成功");
			};
			options.onupdate = function() {
				ok(true, "onupdate方法调用成功");
			};
			// 构造一个fixable对象 
			var fix = w.baidu.dom.fixable(div,options);
			equal(w.$('div#test1').css('width'), '600px', "超出最大范围，父页面无影响");
			equal(w.baidu.dom.getPosition(div).left, 1000, "fix之后，页面内容无法展现。left：");
			w.scrollTo(100, 100);
			equal(w.baidu.dom.getPosition(div).left, 1100, "fix之后，滚动后。left：");
			fix.release();
			equal(w.baidu.dom.getPosition(div).left , 20 , "release后，恢复原始值");
			op.finish();
		}
	});
});