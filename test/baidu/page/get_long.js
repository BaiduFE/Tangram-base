var resultEle = document.getElementById("resultOutput");
	function getValue(){
		var scrollTop = baidu.page.getScrollTop(),
		scrollLeft = baidu.page.getScrollLeft(),
		pageWidth = baidu.page.getWidth(),
		pageHeight = baidu.page.getHeight(),
		pageViewHeight = baidu.page.getViewHeight(),
		pageViewWidth = baidu.page.getViewWidth();
		
		resultEle.innerHTML = resultEle.innerHTML + '<p>'+
			'getWidth:' + pageWidth + '        '
			+ 'getHeight:' + pageHeight + '</p><p>'
			+ 'getScrollLeft:' + scrollLeft + '        '
			+ 'getScrollTop:' + scrollTop + '</p><p>'
			+ 'getViewWidth:' + pageViewWidth + '    '
			+ 'getViewHeight:' + pageViewHeight+'----case pass</p><p></p>';
	}
	getValue();