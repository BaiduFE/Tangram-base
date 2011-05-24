(function() {
	var t = window.TRunner = {},
	// case class
	case_class = 'jsframe_qunit',
	// case status
	case_running_class = 'running_case';
	window.run = t.run = function(dom) {
		dom = dom || t.data.case_running || t.data.cases[0];
		// 修改IFrame的src，指向新用例的执行地址
		TT.dom.addClass(dom, case_running_class);
		t.RunningFrame.src = dom.href;
	};

	t.init = function() {
		// 创建执行用IFrame，并初始化部分变量，绑定事件
		t.RunningFrame = t.RunningFrame || document.createElement('iframe');
		t.RunningFrame.className = 'runningframe';
		TT.g('id_runningarea').appendChild(t.RunningFrame);
		TT.dom.show('id_runningarea');

		// 初始化数据结构
		t.data = {
			cases : TT.q(case_class, TT.g('id_testlist'), 'a')
		};
		t.data.case_running = t.data.cases[0];

		// 绑定执行结束事件
		window.oncasedone = t.done;

		t.run();
	};

	t.done = function() {
		// 提取用例运行的详细信息，不再通过主动上报方式，
		// 自行获取，避免多处同时修改的问题

		// 判定当前节点存在下一个节点并批量执行状态时下一个
		var cr = t.data.case_running,
		// 处理测试结果
		result = function() {

		},
		// 处理覆盖率信息
		cov = function() {

		};
		console.log(cr.title);
		if (cr.nextSibling && cr.nextSibling.tagName == 'a'
				&& location.search.indexOf('batchrun=true')) {
			t.data.case_running = cr.nextSibling;
			t.run();
		}

	};

	t.report = function() {
	};

	TT.dom.ready(t.init);
})();