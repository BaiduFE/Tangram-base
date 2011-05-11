function run(kiss, runnext) {

	window.document.title = kiss;
	var wb = window.brtest = window.brtest || {};

	wb.timeout = wb.timeout || 8000;
	wb.breakOnError = /breakonerror=true/gi.test(location.search)
			|| $('input#id_control_breakonerror').attr('checked');
	wb.runnext = /batchrun=true/gi.test(location.search) || runnext
			|| $('input#id_control_runnext').attr('checked');
	wb.kiss = kiss;
	var cid = 'id_case_' + kiss.split('.').join('_');
	/* 只有参数有showsrconly的时候才显示div */
	if (/showsrconly=true/gi.test(location.search)) {
		var div = document.getElementById('id_testlist_srconly');
		div.style.display = 'block';
	}
	/* id中由于嵌入用例名称，可能存在导致通过id直接$无法正确获取元素的情况 */
	wb.kissnode = $(document.getElementById(cid));
	wb.kisses = wb.kisses || {};
	// 把没有用例的情况加入到报告中
	if (!wb.kisslost) {
		$('div#id_showSrcOnly a').each(function() {
			wb.kisses[this.title] = '0,0,_,0,0';
		});
		wb.kisslost = true;
	}
	wb.kisscov = wb.kisscov || {};

	var wbkiss = wb.kisses[wb.kiss] = wb.kisses[wb.kiss] || '';

	/**
	 * 超时处理
	 */
	var toh = setTimeout(function() {
		if (!window.brtest.breakOnError)
			$(wb).trigger('done', [ new Date().getTime(), {
				failed : 1,
				passed : 1
			}, frames[0].$_jscoverage, 'timeout' ]);
	}, wb.timeout);
	/**
	 * 为当前用例绑定一个一次性事件
	 */
	$(wb)
			.one(
					'done',
					function(event, a, b, covinfo) {
						clearTimeout(toh);
						var wb = window.brtest, errornum = b.failed, allnum = b.failed
								+ b.passed;// , testTimeOutFlag = b[2];
						wb.kissend = new Date().getTime();
						if (covinfo !== null)// 如果支持覆盖率
							wb.kisscov[wb.kiss] = covinfo;
						wb.kissnode.removeClass('running_case');
						/*
						 * ext_qunit.js的_d方法会触发done事件
						 * top.$(wbkiss).trigger('done', [ new Date().getTime(),
						 * args ]); new Date().getTime()指向a参数，args指向b参数
						 */
						wb.kisses[wb.kiss] = errornum + ',' + allnum + ',_,'
								+ wb.kissstart + ',' + wb.kissend;

						if (errornum > 0) {
							wb.kissnode.addClass('fail_case');
							// wb.kisses[kiss + '_error'] =
							// window.frames[0].innerHTML;
						} else
							wb.kissnode.addClass('pass_case');

						if (wb.runnext
								&& (!wb.breakOnError || parseInt(wb.kisses[wb.kiss]
										.split(',')[0]) == 0)) {
							var nextA = wb.kissnode.next()[0];
							if (nextA.tagName == 'A') {
								if (wb.kisses[nextA.title] === undefined)
									run(nextA.title, wb.runnext);
							} else {
								/* 隐藏执行区 */
								// $('div#id_runningarea').toggle();
								/* ending 提交数据到后台 */
								wb.kisses['config'] = location.search
										.substring(1);
								var url = /mail=true/.test(location.search) ? 'record.php'
										: 'report.php';
								covcalc();
								/**
								 * 启动时间，结束时间，校验点失败数，校验点总数
								 */
								$.ajax({
									url : url,
									type : 'post',
									data : wb.kisses,
									success : function(msg) {
										// $('#id_testlist').hide();
										/* 展示报告区 */
										$('#id_reportarea').show().html(msg);
									},
									error : function(xhr, msg) {
										alert('fail' + msg);
									}
								});
							}
						}
					});

	/**
	 * 初始化执行区并通过嵌入iframe启动用例执行
	 */
	var url = 'run.php?case=' + kiss + '&' + location.search.substring(1);
	// + (location.search.length > 0 ? '&' + location.search.substring(1)
	// : '');

	var fdiv = 'id_div_frame_' + kiss.split('.').join('_');
	var fid = 'id_frame_' + kiss.split('.').join('_');
	wb.kissnode.addClass('running_case');
	if ($('input#id_control_hidelist').attr('checked'))
		$('div#id_testlist').css('display', 'none');
	/* 隐藏报告区 */
	$('div#id_reportarea').empty().hide();
	/* 展示执行区 */
	$('div#id_runningarea').empty().css('display', 'block').append(
			'<iframe id="' + fid + '" src="' + url
					+ '" class="runningframe"></iframe>');
	wb.kissstart = new Date().getTime();
};
// 需要根据一次批量执行整合所有文件的覆盖率情况
function covcalc() {
	function covmerge(cc, covinfo) {
		for ( var key in covinfo) {
			for ( var idx in covinfo[key]) {
				if (idx != 'source') {
					cc[key] = cc[key] || [];
					cc[key][idx] = (cc[key][idx] || 0) + covinfo[key][idx];
				}
			}
		}
		return cc;
	}
	var cc = {};
	var brkisses = window.brtest.kisses;
	for ( var key in window.brtest.kisscov)
		covmerge(cc, window.brtest.kisscov[key]);
	//--------------处理summary页面，用于生成静态summary页面，用于ci集成-------------------
	var htmlarray = jscoverage_recalculateSummary(cc);//生成summary页面，下面的只是计算百分比
	if(htmlarray&&htmlarray.length>0){
	    brkisses['covsummaryinfo'] = "["+htmlarray[0]+"]、["+htmlarray[1]+"]";//{totals:htmlarray[0],caseinfo:htmlarray[1]};
	};
	brkisses['covsourceinfo'] = getSourceStrs(window.brtest.kisscov);//生成souce代码
	//--------------------------------------------------------------------------------
	
	var file;
	var files = [];
	for (file in cc) {
		if (!cc.hasOwnProperty(file)) {
			continue;
		}

		files.push(file);
	}
	files.sort();
	for ( var f = 0; f < files.length; f++) {
		file = files[f];
		var lineNumber;
		var num_statements = 0;
		var num_executed = 0;
		var missing = [];
		var fileCC = cc[file];
		var length = fileCC.length;
		var currentConditionalEnd = 0;
		var conditionals = null;
		if (fileCC.conditionals) {
			conditionals = fileCC.conditionals;
		}
		for (lineNumber = 0; lineNumber < length; lineNumber++) {
			var n = fileCC[lineNumber];

			if (lineNumber === currentConditionalEnd) {
				currentConditionalEnd = 0;
			} else if (currentConditionalEnd === 0 && conditionals
					&& conditionals[lineNumber]) {
				currentConditionalEnd = conditionals[lineNumber];
			}

			if (currentConditionalEnd !== 0) {
				continue;
			}

			if (n === undefined || n === null) {
				continue;
			}

			if (n === 0) {
				missing.push(lineNumber);
			} else {
				num_executed++;
			}
			num_statements++;
		}

		var percentage = (num_statements === 0 ? 0 : parseInt(100
				* num_executed / num_statements));
		var kiss = file.replace('.js', '').split('/').join('.');
		// 统计所有用例的覆盖率信息和测试结果

		if (brkisses[kiss] == undefined)
			brkisses[kiss] = '0,0,_,0,0';
		var info = brkisses[kiss].split(',_,');// 覆盖率的处理在最后环节加入到用例的测试结果中
		brkisses[kiss] = info[0] + ',' + percentage + ',' + info[1];
	}
}

function jscoverage_recalculateSummary(cc) {//生成summary数据的主要方法
  var totals = { files:0, statements:0, executed:0 };
  var file;
  var files = [];
  for (file in cc) {
    if (! cc.hasOwnProperty(file)) {
      continue;
    }
    files.push(file);
  }
  files.sort();
  var caseinfostr = '';
  var rowCounter = 0;
  for (var f = 0; f < files.length; f++) {
    file = files[f];
    var lineNumber;
    var num_statements = 0;
    var num_executed = 0;
    var missing = [];
    var fileCC = cc[file];
    var length = fileCC.length;
    var currentConditionalEnd = 0;
    var conditionals = null;
    if (fileCC.conditionals) {
      conditionals = fileCC.conditionals;
    }
    for (lineNumber = 0; lineNumber < length; lineNumber++) {
      var n = fileCC[lineNumber];

      if (lineNumber === currentConditionalEnd) {
        currentConditionalEnd = 0;
      }
      else if (currentConditionalEnd === 0 && conditionals && conditionals[lineNumber]) {
        currentConditionalEnd = conditionals[lineNumber];
      }

      if (currentConditionalEnd !== 0) {
        continue;
      }

      if (n === undefined || n === null) {
        continue;
      }

      if (n === 0) {
        missing.push(lineNumber);
      }
      else {
        num_executed++;
      }
      num_statements++;
    }

    var percentage = ( num_statements === 0 ? 0 : parseInt(100 * num_executed / num_statements) );
    var className = ( rowCounter++ % 2 == 0 ? "odd" : "even" );
    //------------构造js方法名，此js方法用于得到source----
    var getSourceFunc = file;
    while(getSourceFunc.indexOf("/")>-1){//生成js方法名
        getSourceFunc = getSourceFunc.replace('/','1');
    }
    getSourceFunc = 'get_'+getSourceFunc.substring(0,getSourceFunc.length-3);
    //-------------------------------------------------
    caseinfostr += "<tr class="+className+" >";
    caseinfostr += "<td class=leftColumn><a href=# onclick='setSourceHtml(\""+getSourceFunc+"\")'>"+file+"</a></td>";
    caseinfostr += "<td class=numeric>"+num_statements+"</td>";
    caseinfostr += "<td class=numeric>"+num_executed+"</td>";  
    // new coverage td containing a bar graph
    var covereddivstr = '',pctdivstr = '';
    if( num_statements === 0 ) {
        var covered_className = "skipped";
        covereddivstr += "<div class="+covered_className+" ></div>";
        pctdivstr += "<span class=pct>0</span>";
    } else {
        var covered_className = "covered";
        covereddivstr += "<div class="+covered_className+" style=width:"+percentage+"px;></div>";
        pctdivstr += "<span class=pct>"+percentage + "%"+"</span>";
    }
    caseinfostr += "<td class=coverage><div class=pctGraph>"+covereddivstr+"</div>"+pctdivstr+"</td>";
    
    caseinfostr += "<td>";
      for (var i = 0; i < missing.length; i++) {
        if (i !== 0) {
          caseinfostr += '  ';//空格分隔遗失行
        }
//        link = jscoverage_createLink(file, missing[i]);
        // group contiguous missing lines; e.g., 10, 11, 12 -> 10-12
        var j, start = missing[i];
        for (;;) {
          j = 1;
          while (i + j < missing.length && missing[i + j] == missing[i] + j) {
            j++;
          }
          var nextmissing = missing[i + j], cur = missing[i] + j;
          if (isNaN(nextmissing)) {
            break;
          }
          while (cur < nextmissing && ! fileCC[cur]) {
            cur++;
          }
          if (cur < nextmissing || cur >= length) {
            break;
          }
          i += j;
        }
        if (start != missing[i] || j > 1) {
          i += j - 1;
          caseinfostr += "<a href=# onclick=fixedSourceHtml(&#39"+getSourceFunc+"&#39,"+start+") >"+start+"_"+missing[i]+"</a>";
        }
        else caseinfostr += "<a href=# onclick=fixedSourceHtml(&#39"+getSourceFunc+"&#39,"+missing[i]+") >"+missing[i]+"</a>";
      }

    caseinfostr += "</td></tr>";
    totals['files'] ++;
    totals['statements'] += num_statements;
    totals['executed'] += num_executed;
  }
    // write totals data into summaryTotals row
    var totalsstr = "";
    totalsstr += "<td class=leftColumn><span class=title>Total:</span><span>"+totals['files']+"</span></td>";
    totalsstr += "<td class=numeric>"+totals['statements']+"</td>";
    totalsstr += "<td class=numeric>"+totals['executed']+"</td>";
    var coverage = parseInt(100 * totals['executed'] / totals['statements']);
    if( isNaN( coverage ) ) {
       coverage = 0;
    }
    totalsstr += "<td class=coverage><div class=pctGraph><div class=covered style=width:"+coverage+"px; ></div></div><span class=pct>"+coverage+"%"+"</span></td><td id=missingCell></td>";
  
   var strs = [totalsstr,caseinfostr];
  return strs;
  
}

/**
 * 生成souce 页源码字符串组合，作为data的一项传到report.php里解析
 */
 function getSourceStrs(covinfo){
      var sourceStrs = '';
      var coverage = {};
      for ( var key in covinfo) {
      	coverage = covinfo[key];
      	break;
      }
      for ( var key in coverage) {
          sourceStrs += "{"+key+":"+jscoverage_makeTable(coverage[key])+"},a";
      }
      return sourceStrs;
 }

/**
 * 生成sourceTab 页代码
 */
function jscoverage_makeTable(coverage) {
  var lines = coverage.source;
  // this can happen if there is an error in the original JavaScript file
  if (! lines) {
    lines = [];
  }
  var rows = ['<table id="sourceTable">'];
  var i = 0;
  var progressBar = document.getElementById('progressBar');
  var tableHTML;
  var currentConditionalEnd = 0;

  while (i < lines.length) {
    var lineNumber = i + 1;

    if (lineNumber === currentConditionalEnd) {
      currentConditionalEnd = 0;
    }
    else if (currentConditionalEnd === 0 && coverage.conditionals && coverage.conditionals[lineNumber]) {
      currentConditionalEnd = coverage.conditionals[lineNumber];
    }

    var row = '<tr>';
    row += '<td class="numeric">' + lineNumber + '</td>';
    var timesExecuted = coverage[lineNumber];
    if (timesExecuted !== undefined && timesExecuted !== null) {
      if (currentConditionalEnd !== 0) {
        row += '<td class="y numeric">';
      }
      else if (timesExecuted === 0) {
        row += '<td class="r numeric" id="line-' + lineNumber + '">';
      }
      else {
        row += '<td class="g numeric">';
      }
      row += timesExecuted;
      row += '</td>';
    }
    else {
      row += '<td></td>';
    }
    row += '<td><pre>' + lines[i] + '</pre></td>';
    row += '</tr>';
 //   row += '\n';
    rows[lineNumber] = row;
    i++;
  }
  rows[i + 1] = '</table>';
  tableHTML = rows.join('');
  return tableHTML;
}

/**
 * 为批量运行提供入口，参数携带batchrun=true
 */
$(document).ready(
		function() {
			if (location.href.search("[?&,]batchrun=true") > 0
					|| $('input#id_control_runnext').attr('checked')) {
				run($('div#id_testlist a').attr('title'), true);
			}
		});
