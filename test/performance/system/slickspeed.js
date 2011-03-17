//base test functions

function forEach(iterable, fn, bind){
	for (var i = 0, j = iterable.length; i < j; i++) fn.call(bind, iterable[i], i, iterable);
};

//test start

window.onload = function(){
	
	var frameworks = {};
	
	forEach(document.getElementsByTagName('iframe'), function(iframe){
        if (iframe.name != 'testFrame') {
            frameworks[iframe.name] = {
                'selectors': []
            };
        }
	});
	
	var tbody = document.getElementById('tbody');
	var tfoot = document.getElementById('tfoot');
	var lastrow = tfoot.getElementsByTagName('tr')[0];
	var rows = [];
	var start = document.getElementById("start");
	var stop = document.getElementById("stop");
	
	start.onclick = function(){
		// randomize tests within rows
		document.getElementById("testTable").style.display = "block";
		document.getElementById("test").style.display = "block";
		document.getElementById("chooseTest").style.display = "none";
		tests.sort(function(a,b) { 
			if (a.row_num == b.row_num)
				return Math.random() < 0.5 ? 1: -1
			else
				return a.row_num - b.row_num;
		});
		testRunner();
		return false;
	};
	
	stop.onclick = function(){
		clearTimeout(timer);
		timer = null;
		return false;
	};
	
	var score = [];
	var scores = {};
	
	var frxi = 0;
	for (var name in frameworks){
		var framework = frameworks[name];
        framework.test = 'test' + name.split(' ')[0]; //根据框架引用test函数, 如testECUI
		forEach(window.selectors, function(selector){
			framework.selectors.push(selector);
		});
		scores[name] = lastrow.getElementsByTagName('td')[frxi];
		score[name] = 0;
		frxi++;
	}
	
	var tests = [];
	forEach(window.selectors, function(selector, i){
		var frxi = 0;
		var row = tbody.getElementsByTagName('tr')[i];
 		rows[i] = 0;
		for (var name in frameworks){
			var framework = frameworks[name];
			var cell = row.getElementsByTagName('td')[frxi];
			tests.push({
				'execute': framework.test,
				'selector': framework.selectors[i],
				'name': name,
				'row': row,
				'cell' : cell,
				'row_num': i
			});
			rows[i]++;
			frxi++;
		}
	});
	
	var submitRun = false;
	var submitTest = function(data){
		
		if(!data || !confirm("测试完毕，是否提交测试结果")){
			return;
		}

		var pay = { scores:{}, ua:navigator.userAgent };
		for(var i in data){
			pay.scores[i] = data[i].innerHTML.match(/[0-9]+/)[0];
		}
		
		var s = document.createElement('script');
		s.src = "frameworks/dojo-131.js";
		var h = document.getElementsByTagName("head")[0];
		s.onload = s.onreadystatechange = function(e){
			if((e && e.type == "load") || /loaded|complete/.test(s.readyState)){
				dojo.xhrPost({ 
					url:"report.php",
					content: { data: dojo.toJson(pay) },
					load:function(){
						submitRun = true;
					}
				});
			}
		}
		h.appendChild(s);
	}
	
	var timer = null;
	var resultList = [];

	var testRunner = function(){
		var test = tests[0];
		if(!test){ 
			submitTest(scores);
			return;
		}
        var iframe = document.getElementById(test.name.replace(/[ \.]/g, '_'));
        var list = iframe.src.split('&');
        list.pop();
        list.push('nocache=' + new Date().getTime());
        document.getElementById('testFrame').src = list.join('&');
    }

    var testRunner1 = window.testRunner1 = function () {
        timer = setTimeout(testRunner2, 125);
    }

    var testRunner2 = window.testRunner2 = function () {
        var test = tests[0];
        var iframe = frames['testFrame'];
		results = iframe.window[test.execute](test.selector);
        resultList.push(results);
		if (resultList.length == 3 || results.error) {
            if (!results.error) {
				results = resultList[0];
			    resultList = [resultList[0].time, resultList[1].time, resultList[2].time];
		        resultList.sort();
	            results.time = resultList[1];
			}
    		tests.shift();
            resultList = [];

            test.cell.className = 'test';
			
            test.cell.innerHTML = '<b>' + results.time + ' ms</b><b>' + results.found + '</b>';
            test.cell.speed = results.time;
            if (results.error){
                test.cell.innerHTML = results.time + ' ms | <span class="exception" title="' + results.error + '">error returned</a>';
                test.cell.className += ' exception';
                test.cell.found = 0;
                test.cell.error = true;
            } else {
                test.cell.found = results.found;
                test.cell.error = false;
            }
            results.code = results.code.toString().replace(/^.*\{/,'').replace(/\s*\}\s*$/,'');
            results.code = results.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\t/g,'&nbsp;&nbsp;');
            test.cell.innerHTML = ['<a class="code"><pre>', results.code, '</pre></a>', test.cell.innerHTML].join('');
            test.cell.onclick = function(){
                if (/showcode/.test(test.cell.className))
                    test.cell.className = test.cell.className.replace(' showcode','');
                else
                    test.cell.className += ' showcode';
            }
            
            score[test.name] += test.cell.speed;
            scores[test.name].innerHTML =  '&nbsp;' + score[test.name] + '&nbsp;';
			//todo
			
			document.getElementById(test.name.split(" ")[0]).style.width = 1+score[test.name]/200 +"px"
            
            rows[test.row_num]--;
            if(rows[test.row_num] == 0) colourRow(test.row);
        }
		timer = setTimeout(testRunner, 125);
	};
	
	var colourRow = function(row){
		
		var cells = [];
		
		var tds = row.getElementsByTagName('td');
		forEach(tds, function(td){
			cells.push(td);
		});
		
		var speeds = [];
		
		forEach(cells, function(cell, i){
			if (!cell.error) speeds[i] = cell.speed;
			//error, so we exclude it from colouring good. does not affect score (it should?).
			else speeds[i] = 99999999999999999999999;
		});
		
		var min = Math.min.apply(this, speeds);
		var max = Math.max.apply(this, speeds);
		// FIXME: is this a good way? should we mean the speeds? median?
		var threshold = min; // Math.floor(min / 2); // ms
		
		var found = {};
		var mismatch = false;
		forEach(cells, function(cell, i){
            var s = cell.found;
			found[s] ? found[s]++ : (found[s] = 1);
/*			if (!mismatch){
				forEach(found, function(n){
					if (!cell.error && cell.found != undefined && n && cell.found != n){
						mismatch = true;
						return;
					}
				});
			}
*/			
			s = cell.speed;
			if (s == min) cell.className += ' best';
			else if (s <= min + threshold) cell.className += ' good';
			else if (s >= max - threshold) cell.className += ' bad';
			else cell.className += ' normal';
		});
		
//		if (mismatch){
			forEach(cells, function(cell, i){
				if (found[cell.found] == 1) cell.className += ' mismatch';
			});
//		}
		
	};
	

};
