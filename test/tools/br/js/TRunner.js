(function() {
	var t = window.TRunner = {},
	// case class
	case_class = 'jsframe_qunit',
	// case status
	case_running_class = 'running_case',
	// batch run
	batchrun = location.search.indexOf("batchrun=true") > 0;
	window.run = t.run = function(dom) {
		dom = dom || t.data.cases[t.data.case_running];
		if (!dom) // 取不到当前用例就直接退出
			return;
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
			cases : TT.q(case_class, TT.g('id_testlist'), 'a'),
			case_running : 0,
			cases_finish : [],
			cases_cov : {}
		};

		// 绑定执行结束事件
		window.oncasedone = t.done;
		if (batchrun)
			t.run();
	};

	t.done = function(fail, total, covinfo) {
		// 提取用例运行的详细信息，不再通过主动上报方式，
		// 自行获取，避免多处同时修改的问题

		// 判定当前节点存在下一个节点并批量执行状态时下一个
		var dom = t.data.cases[t.data.case_running],
		// 处理测试结果
		result = function() {
			TT.ajax.post()
		},
		// 处理覆盖率信息
		cov = function() {
			// 目前只有一个iframe嵌入的情况，暂时处理策略
			var w = window.frames[0];
			if (w._$jscoverage) {
				t.data.cases_cov[dom.path] = w._$jscoverage;
			}
		};

		TT.dom.removeClass(dom, case_running_class);
		// TT.dom.addClass()
		if (batchrun) {
			// 判断下一个标签不是用例或者用例已经执行过则直接中断
			if (t.data.cases_finish[t.data.case_running++])
				return;
			// 为旧的环境清理预留0.2秒的时间
			setTimeout(t.run, 200);
		}
	};

	/**
	 * 整合覆盖率信息并发送测试报告
	 */
	t.report = function() {
	};

	TT.dom.ready(t.init);
})();