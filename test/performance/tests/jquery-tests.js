window.tests = {
    'start': function (count) {
        var html = [];
        while (count--) {
            html.push('<div id="test' + count + '" class="test test' + count + ' test' + count + '"></div>');
        }
        document.body.innerHTML = html.join('');
    },

    'end': function (count) {
    },

	'baidu.dom.g': {
		'code': function (i) {
            $('#test' + i)
        },
		'count': 2000
	},

	'baidu.dom.addClass': {
		'code': function (i) {
            $('#test' + i).addClass('custom');
        },
		'count': 2000
	},
	
	'baidu.dom.removeClass': {
		'code': function (i) {
            $('#test' + i).removeClass('test' + i);
        },
		'count': 2000
	},

	'baidu.dom.hide': {
		'code': function (i) {
            $('#test' + i).hide(false);
        },
		'count': 2000
	},

	'baidu.dom.show': {
		'code': function (i) {
            $('#test' + i).show(false);
        },
		'count': 2000
	},

	'baidu.dom.insertHTML': {
		'code': function (i) {
            $('#test' + i).append('<span>this is span!</span>');
        },
		'count': 2000
	},

	'baidu.dom.remove': {
		'code': function (i) {
            $('#test' + i).remove();
        },
		'count': 2000
	},
	
	'baidu.dom.getPosition': {
		'code': function (i) {
            $('#test' + i).position();
        },
		'count': 2000
	},

	'baidu.dom.first': {
		'code': function (i) {
            $('#test' + i).first();
        },
		'count': 2000
	},

    'baidu.dom.last': {
		'code': function (i) {
            $('#test' + i).last();
        },
		'count': 2000
	},

	'baidu.dom.next': {
		'code': function (i) {
            $('#test' + i).next();
        },
		'count': 2000
	},

	'baidu.dom.prev': {
		'code': function (i) {
            $('#test' + i).prev();
        },
		'count': 2000
	},
	
	'baidu.string.trim': {
        'start': function () {
        },
        'end': function () {
        },
		'code': function (i) {
            $.trim('  hello, world  ');
        },
		'count': 2000
	}
};
