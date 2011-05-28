(function() {
	var t = window.TRunner = {
		TIMEOUT : 8000,
		case_jscoverage : {},
		case_testresult : {}
	},
	// case classes
	classes = {
		normal : 'jsframe_qunit',
		running : 'running_case',
		fail : 'fail_case',
		pass : 'pass_case'
	},
	// batch run
	batchrun = location.search.indexOf("batchrun=true") > 0;

	t.init = function() {
		TT.dom.show('id_runningarea');

		// 初始化数据结构
		TT.object.extend(t, {
			cases : TT.q(classes.normal, TT.g('id_testlist'), 'a'),
			case_index : 0
		});

		// 绑定执行结束事件
		window.oncasedone = t.done;
		if (batchrun)
			t.run();
	};

	t.run = window.run = function(dom) {
		dom = dom || t.cases[t.case_index];
		if (!dom) // 取不到当前用例就直接退出
			return;
		// 修改IFrame的src，指向新用例的执行地址
		TT.dom.addClass(dom, classes.running);

		// 创建执行用IFrame，并初始化部分变量，绑定事件
		if (t.RunningFrame) {
			TT.dom.remove(t.RunningFrame);
		}
		t.RunningFrame = document.createElement('iframe');
		TT.dom.addClass(t.RunningFrame, 'runningframe');
		TT.g('id_runningarea').appendChild(t.RunningFrame);
		t.RunningFrame.src = dom.href
				+ (location.search.indexOf('cov=true') > 0 ? "&cov=true" : "");
		if (batchrun) {
			t.timeoutHandle = setTimeout(t.done, t.TIMEOUT);
		}
	};

	/**
	 * 用例执行结束逻辑
	 * <li>更新用例界面显示状态
	 * <li>记录覆盖率结果
	 * <li>记录测试结果
	 * <ul>
	 * 判断是否批量执行并是否结束
	 * <li>如果结束则整合覆盖率信息并发送测试结果
	 * <li>否则继续下一个用例
	 * 
	 */
	t.done = function(fail, total, covinfo) {
		clearTimeout(t.timeoutHandle);
		// 超时处理
		if (!TT.lang.isNumber(fail)) {
			fail = 1;
			total = 1;
		}

		// 由于最后统一运算消耗资源导致浏览器不响应，修改为每次结束时merge

		var index = t.case_index,
		//
		dom = t.cases[index],
		//
		path = dom.attributes['path'].value;
		// 用例状态更新
		TT.dom.removeClass(dom, classes.running);
		TT.dom.addClass(dom, fail == 0 ? classes.pass : classes.fail);

		// 更新测试结果
		t.case_testresult[path] = fail + ',' + total;

		// 更新覆盖率
		cov_merge(covinfo);

		if (batchrun) {

			// 发送测试结果
			if (t.cases.length == index + 1) {
				// 整合覆盖率
				// var covmerged = cov_merge(t.case_cov),
				// 计算覆盖率并扁平化
				covserials = cov_percent(t.case_jscoverage, t.case_testresult);
				// 追加参数到结果中
				t.case_testresult['config'] = covserials['config'] = location.search
						.substring(1)
						+ "&total_coverage=" + covserials[1];
				// 发送测试结果
				TT.ajax.post('report_cov.php', TT.url
						.jsonToQuery(covserials[0]));
				TT.ajax.post('report.php', TT.url
						.jsonToQuery(t.case_testresult));
			} else if (t.case_testresult[t.cases[index + 1].attributes['path']])
				// 如果下一个用例的测试结果已经被记录直接返回，此情况为手工点击
				return;
			else {
				t.case_index++;
				// 执行下一个用例，为旧的环境清理预留0.2秒的时间
				setTimeout(t.run, 0);
			}
		}

	};

	TT.dom.ready(t.init);

	/**
	 * 整合覆盖率
	 */
	function cov_merge(cov_info) {
		var cc = t.case_jscoverage;
		if (cov_info)
			TT.object.each(cov_info, function(v, k) {
				if (!cc[k])
					cc[k] = [];
				TT.array.each(v, function(num, line) {
					if (typeof num == 'undefined' || cc[k][line] == 1)
						return;
					cc[k][line] = num == 0 ? 0 : 1;
				});
			});
	}

	function cov_percent(cov_info, case_result) {
		var percent = {}, total_code_number = 0, total_code_coveraged = 0;
		TT.object.each(cov_info, function(info, path) {
			var count = 0, covered = 0, per = "";
			TT.array.each(info, function(num, line) {
				if (typeof num == 'undefined')
					return;
				if (num == 0) {
					covered++;
					total_code_coveraged++;
				}
				count++;
				total_code_number++;
				per += line + ":" + num + ",";// 序列化以传递复杂结构
			});
			var _percent = (100 * covered / count).toFixed(2);
			case_result[path] += "," + _percent;
			percent[path] = _percent + "|" + per;
		});
		return [ percent, (total_code_coveraged / total_code_number).toFixed(2) ];
	}
})();