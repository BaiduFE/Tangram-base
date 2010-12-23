QW.NodeC={
	arrayMethods:[//部分Array的方法也会集成到NodeW里
		'map',
		'forEach',
		'filter',
		'toArray'
	],
	wrapMethods:{ //在此json里的方法，会返回带包装的结果，如果其值为-1，返回“返回值”的包装结果,否则返回第i个位置的参数的包装结果
		//来自EventTargetH
		on	: 0,
		un	: 0,
		delegate	: 0,
		undelegate	: 0,
		fire	: 0,
		click	: 0,
		submit	: 0,
		
		//来自NodeH
		//getJsAttr
		//getExAttr
		$	: -1,
		query	: -1,
		getElementsByClass	: -1,
		getElementsByTagName	: -1,
		ancestorNode	: -1,
		nextSibling	: -1,
		previousSibling	: -1,
		firstChild	: -1,
		lastChild	: -1,
		//contains
		//appendChild
		insertBefore	: -1,
		insertAfter	: -1,
		insertSiblingBefore	: -1,
		insertSiblingAfter	: -1,
		removeChild	: -1,
		removeNode	: -1,
		cloneNode	: -1,
		setAttr	: 0,
		//getAttr
		removeAttr	: 0,
		//insertAdjacentHTML
		insertAdjacentElement	: -1,
		//getValue
		setValue	: 0,
		//getHtml
		setHtml	: 0,
		//hasClass
		addClass	: 0,
		removeClass	: 0,
		replaceClass	: 0,
		toggleClass	: 0,
		show	: 0,
		hide	: 0,
		toggle	: 0,
		//getStyle
		setStyle	: 0,
		//getCurrentStyle
		//isVisible
		//getXY
		setXY	: 0,
		//getSize
		setSize	: 0,
		setInnerSize	: 0,
		//borderWidth
		//paddingWidth
		//marginWidth
		//getRect
		setRect	: 0,
		setInnerRect	: 0,
		setFullscreen	: 0,
		setCenter	: 0,
		set	: 0,
		//get
		//encodeURIForm
		//isFormChanged
		
		//来自ArrayH
		//map
		forEach	: 0,
		filter	: -1
		//toArray
	},
	gsetterMethods : { //在此json里的方法，会是一个getter与setter的混合体
		val :['getValue','setValue'],
		html : ['getHtml','setHtml'],
		attr :['','getAttr','setAttr'],
		css :['','getCurrentStyle','setStyle'],
		size : ['getSize', 'setSize'],
		xy : ['getXY', 'setXY']
	}
};
